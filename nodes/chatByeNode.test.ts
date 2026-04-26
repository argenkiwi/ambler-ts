import { assertEquals } from "@std/assert";
import { stop } from "../ambler.ts";
import * as ChatByeNode from "./chatByeNode.ts";

Deno.test("chatByeNode should print goodbye and return terminal edge", async () => {
  const initialState = {};
  let printed: string | undefined;

  const utils: ChatByeNode.Utils = {
    print: (msg) => {
      printed = msg;
    },
  };

  const edges: ChatByeNode.Edges<typeof initialState> = {
    onDone: () => stop(),
  };

  const nodeResult = ChatByeNode.create(edges, utils)(initialState);

  assertEquals(typeof nodeResult, "function");
  const nextResult = await nodeResult();
  assertEquals(typeof nextResult, "function");
  // @ts-ignore: checking terminal null
  assertEquals(await nextResult(), null);
  assertEquals(printed, "Goodbye!");
});
