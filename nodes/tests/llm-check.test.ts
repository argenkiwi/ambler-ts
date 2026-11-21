import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../llm-check.ts";

test("llmCheckNode should transition to onSuccess when host is reachable", async () => {
  const initialState: State = { host: "http://localhost:11434" };

  const utils: Utils = {
    checkHost: (_host: string) => Promise.resolve(true),
    getPrompt: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory(
    {
      onSuccess: "next",
      onError: "retry",
      onQuit: "quit",
    },
    utils,
  )(initialState);

  expect(result[0]).toEqual("next");
  expect(result[1].host).toEqual("http://localhost:11434");
});

test("llmCheckNode should transition to onError with new host when host is unreachable and user provides new one", async () => {
  const initialState: State = { host: "http://wrong:11434" };

  const utils: Utils = {
    checkHost: (host: string) => Promise.resolve(host === "http://right:11434"),
    getPrompt: (_msg: string) => "http://right:11434",
    print: (_msg: string) => {},
  };

  const result = await factory(
    {
      onSuccess: "next",
      onError: "retry",
      onQuit: "quit",
    },
    utils,
  )(initialState);

  expect(result[0]).toEqual("retry");
  expect(result[1].host).toEqual("http://right:11434");
});

test("llmCheckNode should transition to onError when host is unreachable and user enters nothing", async () => {
  const initialState: State = { host: "http://wrong:11434" };

  const utils: Utils = {
    checkHost: (_host: string) => Promise.resolve(false),
    getPrompt: (_msg: string) => "",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next", onError: "retry", onQuit: "quit" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("retry");
  expect(result[1].host).toEqual("http://wrong:11434");
});

test("llmCheckNode should transition to onQuit at end of input instead of retrying forever", async () => {
  const initialState: State = { host: "http://wrong:11434" };

  const utils: Utils = {
    checkHost: (_host: string) => Promise.resolve(false),
    getPrompt: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next", onError: "retry", onQuit: "quit" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("quit");
  expect(result[1].host).toEqual("http://wrong:11434");
});
