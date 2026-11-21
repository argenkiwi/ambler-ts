import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../stop.ts";

test("stopNode should print final count and call onDone", async () => {
  const initialState: State = { count: 15 };
  let capturedMessage: string | undefined;

  const utils: Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const result = await factory({ onDone: null }, utils)(initialState);

  expect(result[0]).toEqual(null);
  expect(result[1].count).toEqual(15);
  expect(capturedMessage).toEqual("Final count: 15");
});
