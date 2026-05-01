import { assertEquals } from "@std/assert";
import stopNode, { State, Utils } from "../stopNode.ts";

Deno.test("stopNode should print final count and call onDone", async () => {
  const initialState: State = { count: 15 };
  let capturedMessage: string | undefined;

  const utils: Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const result = await stopNode({ onDone: null }, utils)(
    initialState,
  );

  assertEquals(result[0], null);
  assertEquals(result[1].count, 15);
  assertEquals(capturedMessage, "Final count: 15");
});
