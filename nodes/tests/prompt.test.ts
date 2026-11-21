import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../prompt.ts";

test("promptNode should transition to onMessage when user enters a message", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    prompt: (_msg: string) => "hello",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onMessage: "transpose", onQuit: "bye" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("transpose");
  expect(result[1].messages.length).toEqual(1);
  expect(result[1].messages[0]).toEqual({ role: "user", content: "hello" });
});

test("promptNode should transition to onQuit when user enters a quit word", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    prompt: (_msg: string) => "exit",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onMessage: "transpose", onQuit: "bye" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("bye");
  expect(result[1].messages.length).toEqual(0);
});

test("promptNode should transition to onQuit when user cancels input", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    prompt: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onMessage: "transpose", onQuit: "bye" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("bye");
  expect(result[1].messages.length).toEqual(0);
});
