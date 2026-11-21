import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../response.ts";

test("responseNode should transition to onComplete and append assistant response", async () => {
  const initialState: State = {
    messages: [{ role: "user", content: "hello" }],
    host: "http://localhost:11434",
    model: "llama3",
  };
  const utils: Utils = {
    chat: (_messages, _model, _host) => Promise.resolve("hi there"),
    print: (_msg: string) => {},
  };

  const result = await factory({ onComplete: "prompt" }, utils)(initialState);

  expect(result[0]).toEqual("prompt");
  expect(result[1].messages.length).toEqual(2);
  expect(result[1].messages[1]).toEqual({
    role: "assistant",
    content: "hi there",
  });
});
