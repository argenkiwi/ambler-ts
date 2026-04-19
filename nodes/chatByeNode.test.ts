import { assertEquals } from "@std/assert";
import * as ChatByeNode from "./chatByeNode.ts";

Deno.test("chatByeNode should print goodbye and return null", () => {
  const initialState = {};
  let printed: string | undefined;

  const utils: ChatByeNode.Utils = {
    print: (msg) => {
      printed = msg;
    },
  };

  const result = ChatByeNode.create(utils)(initialState);

  assertEquals(result, null);
  assertEquals(printed, "Goodbye!");
});
