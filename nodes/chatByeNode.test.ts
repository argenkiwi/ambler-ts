import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as ChatByeNode from "./chatByeNode.ts";

Deno.test("chatByeNode should print goodbye and return null", async () => {
  const initialState: ChatByeNode.State = {};
  let printed: string | undefined;

  const utils: ChatByeNode.Utils = {
    print: (msg) => {
      printed = msg;
    },
  };

  const result = await ChatByeNode.create(utils)(initialState);

  assertEquals(result, null);
  assertEquals(printed, "Goodbye!");
});
