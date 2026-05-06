import { assertEquals } from "@std/assert";
import { factory, Input, Utils } from "../stopNode.ts";

Deno.test("stopNode should print final count and call onDone", async () => {
  const input: Input = { count: 15 };
  let capturedMessage: string | undefined;

  const utils: Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const result = await factory({ onDone: null }, utils)(
    input,
  );

  assertEquals(result[0], null);
  assertEquals(result[1], undefined);
  assertEquals(capturedMessage, "Final count: 15");
});
