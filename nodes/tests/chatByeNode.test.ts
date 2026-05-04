import { assertEquals } from "@std/assert";
import { factory, Utils } from "../chatByeNode.ts";

Deno.test("chatByeNode should print goodbye and return terminal edge", async () => {
  let printed: string | undefined;

  const utils: Utils = {
    print: (msg: string) => {
      printed = msg;
    },
  };

  const nodeResult = await factory({ onDone: null }, utils)(
    {},
  );

  assertEquals(nodeResult[0], null);
  assertEquals(nodeResult[1], {});
  assertEquals(printed, "Goodbye!");
});
