import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../clone-stop.ts";

test("cloneStopNode should print success message when no error is present", async () => {
  const initialState: State = {
    walkName: "counter",
    targetDir: "/target",
    filesToCopy: ["file1"],
  };

  const messages: string[] = [];
  const utils: Utils = {
    print: (msg) => messages.push(msg),
  };

  const result = await factory({ onDone: null }, utils)(initialState);

  expect(result[0]).toEqual(null);
  expect(
    messages.includes('Successfully cloned walk "counter" to "/target".'),
  ).toEqual(true);
});

test("cloneStopNode should print error message when error is present", async () => {
  const initialState: State = {
    walkName: "counter",
    targetDir: "/target",
    error: "Something went wrong",
  };

  const messages: string[] = [];
  const utils: Utils = {
    print: (msg) => messages.push(msg),
  };

  const result = await factory({ onDone: null }, utils)(initialState);

  expect(result[0]).toEqual(null);
  expect(messages.includes("Error: Something went wrong")).toEqual(true);
});
