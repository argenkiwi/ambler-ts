import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../kpsPlayAgain.ts";

Deno.test("kpsPlayAgainNode should transition to onPlayAgain and reset health when confirmed", async () => {
  const initialState: State = { playerHealth: 0, cpuHealth: 10, playerMove: "kick", cpuMove: "punch", outcome: "Lose" };
  const utils: Utils = {
    confirm: async () => true,
  };

  const result = await factory({ onPlayAgain: "start", onQuit: "stop" }, utils)(initialState);

  assertEquals(result[0], "start");
  assertEquals(result[1].playerHealth, 10);
  assertEquals(result[1].cpuHealth, 10);
  assertEquals(result[1].playerMove, null);
});

Deno.test("kpsPlayAgainNode should transition to onQuit when not confirmed", async () => {
  const initialState: State = { playerHealth: 0, cpuHealth: 10, playerMove: "kick", cpuMove: "punch", outcome: "Lose" };
  const utils: Utils = {
    confirm: async () => false,
  };

  const result = await factory({ onPlayAgain: "start", onQuit: "stop" }, utils)(initialState);

  assertEquals(result[0], "stop");
  assertEquals(result[1].playerHealth, 0);
});
