import { assertEquals } from "@std/assert";
import { factory, Utils } from "../stop.ts";

Deno.test("stopNode should print final count and call onDone", () => {
  const count = 15;
  let capturedMessage: string | undefined;

  const utils: Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const result = factory({ onDone: null }, utils)(count);
  assertEquals(result[0], null);
  assertEquals(result[1], 15);
  assertEquals(capturedMessage, "Final count: 15");
});
