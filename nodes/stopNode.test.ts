import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as StopNode from "./stopNode.ts";

Deno.test("stopNode should print final count and return null", async () => {
  const initialState: StopNode.State = { count: 15 };
  let capturedMessage: string | undefined;

  const utils: StopNode.Utils = {
    print: (msg: string) => {
      capturedMessage = msg;
    },
  };

  const nextResult = StopNode.create(utils)(initialState);

  assertEquals(nextResult, null);
  assertEquals(capturedMessage, "Final count: 15");
});
