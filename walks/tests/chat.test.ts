import { expect, test } from "bun:test";
import { WalkError, walk } from "../../ambler.ts";
import type { Message } from "../../nodes/prompt.ts";
import { createWalk, type State } from "../chat.ts";

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
  const read = () => (lines.length ? lines.shift()! : null);
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
        chat:
          opts.chat ??
          ((messages: Message[]) =>
            Promise.resolve(`echo ${messages.at(-1)!.content}`)),
        print,
      },
      bye: { print },
    },
  };
}

test("chat finds a host, picks a model, answers once, then says bye", async () => {
  const { printed, utils } = script(["2", "hi", "bye"]);

  const final = await walk(createWalk(utils), "LLM_CHECK", initial());

  expect(final.host).toEqual("http://localhost:11434/v1");
  expect(final.model).toEqual("qwen");
  expect(final.messages).toEqual([
    { role: "user", content: "hi" },
    { role: "assistant", content: "echo hi" },
  ]);
  expect(printed.at(-2)).toEqual("Assistant: echo hi");
  expect(printed.at(-1)).toEqual("Goodbye!");
});

test("chat says bye instead of looping when no LLM is found and input ends", async () => {
  const { printed, utils } = script([], { reachable: false });

  const final = await walk(createWalk(utils), "LLM_CHECK", initial());

  expect(final.host).toEqual("");
  expect(printed.at(-1)).toEqual("Goodbye!");
});

test("chat reports which node failed when the LLM request throws", async () => {
  const { utils } = script(["1", "hi"], {
    chat: () => Promise.reject(new Error("connection reset")),
  });

  const error = await walk(createWalk(utils), "LLM_CHECK", initial()).then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(WalkError);
  expect((error as WalkError).message).toEqual(
    "Node CHAT_RESPONSE failed: connection reset",
  );
  expect((error as WalkError).nodeId).toEqual("CHAT_RESPONSE");
});
