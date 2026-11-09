import { assertEquals, assertRejects } from "@std/assert";
import { openChatSessionFile } from "../durable.ts";

/** A minimal OpenAI-compatible server that counts chat requests. */
function fakeLlm() {
  const state = { requests: 0, fail: false, seen: [] as string[][] };
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    if (!new URL(req.url).pathname.endsWith("/chat/completions")) {
      return new Response("not found", { status: 404 });
    }
    state.requests++;
    const body = await req.json();
    if (state.fail) return new Response("boom", { status: 500 });
    const contents = body.messages.map((m: { content: unknown }) =>
      typeof m.content === "string" ? m.content : JSON.stringify(m.content)
    );
    state.seen.push(contents);
    const text = `echo: ${contents.at(-1)}`;
    const enc = new TextEncoder();
    const chunk = (d: unknown) => enc.encode(`data: ${JSON.stringify(d)}\n\n`);
    const base = { id: "1", object: "chat.completion.chunk", created: 0, model: "m" };
    return new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(chunk({ ...base, choices: [{ index: 0, delta: { role: "assistant", content: text }, finish_reason: null }] }));
          c.enqueue(chunk({ ...base, choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } }));
          c.enqueue(enc.encode("data: [DONE]\n\n"));
          c.close();
        },
      }),
      { headers: { "content-type": "text/event-stream" } },
    );
  });
  const host = `http://localhost:${server.addr.port}/v1`;
  return { state, host, stop: () => server.shutdown() };
}

Deno.test("durable chat session", async (t) => {
  const llm = fakeLlm();
  const dir = await Deno.makeTempDir();
  const path = `${dir}/nested/chat.sqlite`;

  try {
    await t.step("a new session has no checkpoint", async () => {
      const session = await openChatSessionFile(path);
      assertEquals(await session.loadCheckpoint(), null);
      await session.close();
    });

    await t.step("chat answers, and the checkpoint survives a reopen", async () => {
      const session = await openChatSessionFile(path);
      const messages = [{ role: "user", content: "hello" }];
      assertEquals(await session.chat(messages, "m", llm.host), "echo: hello");
      const state = {
        messages: [...messages, { role: "assistant", content: "echo: hello" }],
        host: llm.host,
        model: "m",
      };
      await session.saveCheckpoint("CHAT_PROMPT", state);
      await session.close();

      const reopened = await openChatSessionFile(path);
      assertEquals(await reopened.loadCheckpoint(), { nodeId: "CHAT_PROMPT", state });
      await reopened.close();
    });

    await t.step("repeating a turn after a restart does not call the model again", async () => {
      assertEquals(llm.state.requests, 1);
      const session = await openChatSessionFile(path);
      const answer = await session.chat([{ role: "user", content: "hello" }], "m", llm.host);
      assertEquals(answer, "echo: hello");
      assertEquals(llm.state.requests, 1);
      await session.close();
    });

    await t.step("the model sees earlier turns from Pi's transcript", async () => {
      const session = await openChatSessionFile(path);
      const messages = [
        { role: "user", content: "hello" },
        { role: "assistant", content: "echo: hello" },
        { role: "user", content: "again" },
      ];
      assertEquals(await session.chat(messages, "m", llm.host), "echo: again");
      const sent = llm.state.seen.at(-1)!;
      assertEquals(sent.some((c) => c.includes("hello")), true);
      assertEquals(sent.at(-1), "again");
      await session.close();
    });

    await t.step("a failed turn is retried after a restart without duplicating the message", async () => {
      const messages = [
        { role: "user", content: "hello" },
        { role: "assistant", content: "echo: hello" },
        { role: "user", content: "again" },
        { role: "assistant", content: "echo: again" },
        { role: "user", content: "third" },
      ];
      llm.state.fail = true;
      const failing = await openChatSessionFile(path);
      await assertRejects(() => failing.chat(messages, "m", llm.host), Error, "LLM turn failed");
      await failing.close();

      llm.state.fail = false;
      const session = await openChatSessionFile(path);
      assertEquals(await session.chat(messages, "m", llm.host), "echo: third");
      const sent = llm.state.seen.at(-1)!;
      assertEquals(sent.filter((c) => c === "third").length, 1);
      await session.close();
    });
  } finally {
    await llm.stop();
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("chat rejects a conversation that doesn't end with a user message", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const session = await openChatSessionFile(`${dir}/chat.sqlite`);
    await assertRejects(
      () => session.chat([{ role: "assistant", content: "hi" }], "m", "http://localhost:1/v1"),
      Error,
      "last message",
    );
    await session.close();
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
