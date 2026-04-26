import { assertEquals } from "@std/assert";
import { stop } from "../ambler.ts";
import * as StopNode from "./stopNode.ts";

Deno.test("stopNode should print final count and call onDone", async () => {
  const initialState: StopNode.State = { count: 15 };
  let capturedMessage: string | undefined;

  const utils: StopNode.Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const nextResult = await StopNode.create({ onDone: () => stop() }, utils)(
    initialState,
  );

  let step = await nextResult();
  while (typeof step === "function") {
    step = await step();
  }
  assertEquals(step, null);
  assertEquals(capturedMessage, "Final count: 15");
});
