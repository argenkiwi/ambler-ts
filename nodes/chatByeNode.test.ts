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

  const edges: ChatByeNode.Edges<typeof initialState> = {
    onDone: null,
  };

  const nodeResult = await ChatByeNode.create(edges, utils)(initialState);

  assertEquals(nodeResult.next, null);
  assertEquals(nodeResult.state, initialState);
  assertEquals(printed, "Goodbye!");
});
