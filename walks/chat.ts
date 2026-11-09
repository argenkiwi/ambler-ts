import { ambler } from "../ambler.ts";
import { factory as llmCheck } from "../nodes/llm-check.ts";
import { factory as modelSelect } from "../nodes/model-select.ts";
import { factory as chatPrompt, Message } from "../nodes/prompt.ts";
import { factory as chatResponse } from "../nodes/response.ts";
import { factory as chatBye } from "../nodes/chat-bye.ts";
import { type ChatSession, openChatSessionFile } from "../utils/durable.ts";
import { checkHost } from "../utils/llm_chat.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
}

type NodeId =
  | "LLM_CHECK"
  | "MODEL_SELECT"
  | "CHAT_PROMPT"
  | "CHAT_RESPONSE"
  | "CHAT_BYE";

/**
 * Builds the chat graph. The LLM call in CHAT_RESPONSE goes through the
 * durable session, so a turn is never sent to the model twice across restarts.
 */
export function buildChat(session: ChatSession) {
  return ambler<State, NodeId>({
    LLM_CHECK: () =>
      llmCheck({ onSuccess: "MODEL_SELECT", onError: "LLM_CHECK" }),
    MODEL_SELECT: () => modelSelect({ onSuccess: "CHAT_PROMPT" }),
    CHAT_PROMPT: () =>
      chatPrompt({ onMessage: "CHAT_RESPONSE", onQuit: "CHAT_BYE" }),
    CHAT_RESPONSE: () =>
      chatResponse({ onComplete: "CHAT_PROMPT" }, {
        chat: (messages, model, host) => session.chat(messages, model, host),
        print: (msg) => console.log(msg),
      }),
    CHAT_BYE: () => chatBye({ onDone: null }),
  });
}

/**
 * Picks where to start: the saved position if there is one, otherwise a fresh
 * walk. If the saved host is no longer reachable, restart at LLM_CHECK (keeping
 * the conversation) so the user can point at a working host.
 */
async function startingPoint(
  session: ChatSession,
): Promise<[NodeId, State]> {
  const saved = await session.loadCheckpoint();
  if (!saved) return ["LLM_CHECK", { messages: [], host: "", model: "" }];

  const state = saved.state as unknown as State;
  const nodeId = saved.nodeId as NodeId;
  if (!state.host || !state.model || !(await checkHost(state.host))) {
    console.log("Resuming your chat, but the LLM host needs checking first.");
    return ["LLM_CHECK", state];
  }
  console.log(
    `Resuming chat (${state.messages.length} messages) with ${state.model}.`,
  );
  return [nodeId, state];
}

if (import.meta.main) {
  const sessionPath = Deno.args[0] ?? Deno.env.get("CHAT_SESSION") ??
    "./.ambler/chat.sqlite";
  const session = await openChatSessionFile(sessionPath);
  const amble = buildChat(session);

  try {
    let [nodeId, state] = await startingPoint(session) as [
      NodeId | null,
      State,
    ];

    while (nodeId) {
      const next = amble(nodeId, state);
      [nodeId, state] = next instanceof Promise ? await next : next;

      // Checkpoint after every step. Quitting keeps the conversation: the next
      // launch continues at the prompt rather than saying goodbye again.
      if (nodeId) {
        await session.saveCheckpoint(
          nodeId === "CHAT_BYE" ? "CHAT_PROMPT" : nodeId,
          state,
        );
      }
    }
  } finally {
    await session.close();
  }
}
