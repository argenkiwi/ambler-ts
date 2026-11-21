import { assertEquals, assertRejects } from "@std/assert";
import { walk, WalkError } from "../../ambler.ts";
import { createWalk, State } from "../chat.ts";
import type { Message } from "../../nodes/prompt.ts";

const initial = (): State => ({ messages: [], host: "", model: "" });

/** Plays back typed lines and records everything printed. */
function script(
  lines: (string | null)[],
  opts: {
    reachable?: boolean;
    chat?: (messages: Message[]) => Promise<string>;
  } = {},
) {
  const printed: string[] = [];
  const print = (msg: string) => {
    printed.push(msg);
  };
  const read = () => lines.length ? lines.shift()! : null;
  return {
    printed,
    utils: {
      llmCheck: {
        checkHost: () => Promise.resolve(opts.reachable ?? true),
        getPrompt: read,
        print,
      },
      modelSelect: {
        listModels: () => Promise.resolve(["llama", "qwen"]),
        getPrompt: read,
        print,
      },
      prompt: { prompt: read, print },
      response: {
        chat: opts.chat ??
          ((messages: Message[]) =>
            Promise.resolve(`echo ${messages.at(-1)!.content}`)),
        print,
      },
      bye: { print },
    },
  };
}

Deno.test("chat finds a host, picks a model, answers once, then says bye", async () => {
  const { printed, utils } = script(["2", "hi", "bye"]);

  const final = await walk(createWalk(utils), "LLM_CHECK", initial());

  assertEquals(final.host, "http://localhost:11434/v1");
  assertEquals(final.model, "qwen");
  assertEquals(final.messages, [
    { role: "user", content: "hi" },
    { role: "assistant", content: "echo hi" },
  ]);
  assertEquals(printed.at(-2), "Assistant: echo hi");
  assertEquals(printed.at(-1), "Goodbye!");
});

Deno.test("chat says bye instead of looping when no LLM is found and input ends", async () => {
  const { printed, utils } = script([], { reachable: false });

  const final = await walk(createWalk(utils), "LLM_CHECK", initial());

  assertEquals(final.host, "");
  assertEquals(printed.at(-1), "Goodbye!");
});

Deno.test("chat reports which node failed when the LLM request throws", async () => {
  const { utils } = script(["1", "hi"], {
    chat: () => Promise.reject(new Error("connection reset")),
  });

  const error = await assertRejects(
    () => walk(createWalk(utils), "LLM_CHECK", initial()),
    WalkError,
    "Node CHAT_RESPONSE failed: connection reset",
  );
  assertEquals(error.nodeId, "CHAT_RESPONSE");
});
