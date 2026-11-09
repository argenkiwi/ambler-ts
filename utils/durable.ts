import { dirname } from "node:path";
import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import type { JsonValue } from "@earendil-works/chord";
import { createModels, createProvider } from "@earendil-works/pi-ai";
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy";
import {
  createRegistry,
  defineDoc,
  Harness,
} from "@earendil-works/pi-durable";
import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";

const context = BACKGROUND_CONTEXT;
const PROVIDER_ID = "ambler-local";

type ChatMessage = { role: string; content: string };

/** Where an Ambler walk was up to: the next node to run and the state it will receive. */
export interface Checkpoint {
  nodeId: string;
  state: JsonValue;
}

/** A durable chat session backed by one Pi Durable storage. */
export interface ChatSession {
  /** The last saved walk position, or null for a brand new session. */
  loadCheckpoint(): Promise<Checkpoint | null>;
  /** Atomically records the walk position (call after every step). */
  saveCheckpoint(nodeId: string, state: unknown): Promise<void>;
  /**
   * Drop-in for the chat node's `chat` util. The final message must be the
   * user's turn: Pi owns the earlier history in its transcript. Each turn has
   * an idempotent request ID, so a retry after a crash never calls the model
   * twice for the same turn.
   */
  chat(messages: ChatMessage[], model: string, host: string): Promise<string>;
  close(): Promise<void>;
}

type DocShape = { nodeId: string | null; state: JsonValue };

const CheckpointDoc = defineDoc<DocShape>({
  kind: "ambler.chat-checkpoint",
  version: 1,
  scope: "conversation",
  history: "latest",
  fork: "initial",
  initial: () => ({ nodeId: null, state: null }),
  checkpointWhen: () => true,
});

type Storage = Parameters<typeof Harness.open>[0];

/** Opens (or creates) a session stored in a SQLite file, creating its directory. */
export async function openChatSessionFile(path: string): Promise<ChatSession> {
  await Deno.mkdir(dirname(path), { recursive: true });
  return openChatSession(await openNodeSqliteStorage(path));
}

/** Opens a session over any Pi Durable storage (e.g. `MemoryStorage` in tests). */
export async function openChatSession(storage: Storage): Promise<ChatSession> {
  const models = createModels();
  const harness = await Harness.open(
    storage,
    {
      models,
      registry: createRegistry(),
      // A local server that is down should fail fast rather than back off for
      // many seconds; the walk can simply be restarted to retry the turn.
      settings: { retry: { maxRetries: 1 } },
    },
    context,
  );
  // The real model is only known once the walk has picked a host and model, so
  // the root starts with a placeholder and `useModel` points it at the real one.
  const root = await harness.root(context, {
    agent: { model: { provider: PROVIDER_ID, modelId: "unset" } },
  });

  let current = "";
  async function useModel(model: string, host: string) {
    const key = `${host}\n${model}`;
    if (key === current) return;
    models.setProvider(createProvider({
      id: PROVIDER_ID,
      name: "Local LLM",
      baseUrl: host,
      // The OpenAI client insists on a key; local servers ignore its value.
      auth: { apiKey: { name: "local", resolve: async () => ({ auth: { apiKey: "unused" } }) } },
      models: [{
        id: model,
        name: model,
        api: "openai-completions",
        provider: PROVIDER_ID,
        baseUrl: host,
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128000,
        maxTokens: 32000,
      }],
      api: openAICompletionsApi(),
    }));
    await root.configure({ model: { provider: PROVIDER_ID, modelId: model } }, context);
    current = key;
  }

  async function answerText(entryId: number): Promise<string> {
    const page = await root.entries(
      { minEntryId: entryId as never, maxEntryId: entryId as never },
      1,
      undefined,
      context,
    );
    const parts = page.items[0]?.model?.[0]?.content;
    if (!Array.isArray(parts)) return "";
    return parts
      .flatMap((p) => (p.type === "text" ? [p.text as string] : []))
      .join("");
  }

  return {
    async loadCheckpoint() {
      const doc = await harness.snapshot(CheckpointDoc, root.id, context);
      if (!doc?.nodeId) return null;
      return { nodeId: doc.nodeId, state: doc.state };
    },

    async saveCheckpoint(nodeId, state) {
      await root.commit(async (tx) => {
        const doc = await tx.doc(CheckpointDoc, root.id);
        doc.nodeId = nodeId;
        doc.state = state as JsonValue;
      }, context);
    },

    async chat(messages, model, host) {
      const last = messages.at(-1);
      if (last?.role !== "user") {
        throw new Error("durable chat expects the last message to be the user's");
      }
      await useModel(model, host);

      // One idempotent request per turn: after a crash the same ID finds the
      // original submission (and its answer) instead of submitting again.
      const turn = messages.length;
      let submission = await root.submit(
        { type: "input", content: last.content, requestId: `turn-${turn}` },
        context,
      );

      // A previous process may have left this turn failed (e.g. host down).
      // The user message is already in the transcript, so ask the model again
      // with a continue instead of adding the message a second time.
      for (let retry = 1; (await submission.status(context)).status === "unanswered"; retry++) {
        submission = await root.submit(
          { type: "continue", requestId: `turn-${turn}-retry-${retry}` },
          context,
        );
      }

      const settled = await submission.wait(context);
      if (settled.status !== "done") {
        throw new Error(
          `LLM turn failed: ${settled.reason}${settled.detail ? ` (${JSON.stringify(settled.detail)})` : ""}`,
        );
      }
      return await answerText(settled.answer as number);
    },

    async close() {
      await harness.close(context);
    },
  };
}
