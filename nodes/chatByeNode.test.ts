import { assertEquals } from "@std/assert";
import * as ChatByeNode from "./chatByeNode.ts";

Deno.test("chatByeNode should print goodbye and return terminal edge", async () => {
  const initialState = { some: "state" };
  let printed: string | undefined;

  const utils: ChatByeNode.Utils = {
    print: (msg) => {
      printed = msg;
    },
  };

  const nodeResult = await ChatByeNode.create({ onDone: null }, utils)(
    initialState,
  );

  assertEquals(nodeResult.next, null);
  assertEquals(nodeResult.state, initialState);
  assertEquals(printed, "Goodbye!");
});
