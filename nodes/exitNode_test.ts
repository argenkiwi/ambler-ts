import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ExitNode } from "./exitNode.ts";

Deno.test("ExitNode should return null and print goodbye", async () => {
  let printed = "";
  const utils: ExitNode.Utils = {
    print: (msg) => { printed = msg; },
  };

  const nodeResult = await ExitNode.create(utils)({});
  assertEquals(nodeResult, null);
  assertEquals(printed, "Goodbye!");
});
