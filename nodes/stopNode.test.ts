import { assertEquals } from "@std/assert";
import * as StopNode from "./stopNode.ts";

Deno.test("stopNode should print final count and call onDone", () => {
  const initialState: StopNode.State = { count: 15 };
  let capturedMessage: string | undefined;

  const utils: StopNode.Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const result = StopNode.create({ onDone: null }, utils)(
    initialState,
  );

  assertEquals(result[0], null);
  assertEquals(result[1].count, 15);
  assertEquals(capturedMessage, "Final count: 15");
});
