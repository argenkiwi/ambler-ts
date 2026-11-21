import { expect, test } from "bun:test";
import { factory, type Utils } from "../chat-bye.ts";

test("chat-byeNode should transition to onDone", async () => {
  const initialState = {};
  const utils: Utils = {
    print: (_msg: string) => {},
  };

  const result = await factory({ onDone: "end" }, utils)(initialState);

  expect(result[0]).toEqual("end");
});
