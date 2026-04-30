import { assertEquals } from "@std/assert";
import * as ChatByeNode from "./chatByeNode.ts";

Deno.test("chatByeNode should print goodbye and return terminal edge", () => {
  const initialState = { some: "state" };
  let printed: string | undefined;

  const utils: ChatByeNode.Utils = {
    print: (msg) => {
      printed = msg;
    },
  };

  const nodeResult = ChatByeNode.create({ onDone: null }, utils)(
    initialState,
  );

  assertEquals(nodeResult[0], null);
  assertEquals(nodeResult[1], initialState);
  assertEquals(printed, "Goodbye!");
});
