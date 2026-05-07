import { assertEquals } from "@std/assert";
import { factory, Utils } from "../chatBye.ts";

Deno.test("chatByeNode should print goodbye and return terminal edge", () => {
  let printed: string | undefined;

  const utils: Utils = {
    print: (msg: string) => {
      printed = msg;
    },
  };

  const nodeResult = factory({ onDone: null }, utils)();

  assertEquals(nodeResult[0], null);
  assertEquals(nodeResult[1], undefined);
  assertEquals(printed, "Goodbye!");
});
