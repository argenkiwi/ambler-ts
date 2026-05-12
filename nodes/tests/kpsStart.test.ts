import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../kpsStart.ts";

Deno.test("kpsStartNode should initialize health to 10 and transition to onSuccess", async () => {
  const initialState: State = { playerHealth: 0, cpuHealth: 0 };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "playerChoice" }, utils)(initialState);

  assertEquals(result[0], "playerChoice");
  assertEquals(result[1].playerHealth, 10);
  assertEquals(result[1].cpuHealth, 10);
});
