import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../compare.ts";

Deno.test("compareNode should handle a win for player (Kick vs Punch)", async () => {
  const initialState: State = {
    playerHealth: 10,
    cpuHealth: 10,
    playerMove: "kick",
    cpuMove: "punch",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[0], "result");
  assertEquals(result[1].outcome, "Win");
  assertEquals(result[1].cpuHealth, 8);
  assertEquals(result[1].playerHealth, 10);
});

Deno.test("compareNode should handle a trade (Kick vs Kick)", async () => {
  const initialState: State = {
    playerHealth: 10,
    cpuHealth: 10,
    playerMove: "kick",
    cpuMove: "kick",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[0], "result");
  assertEquals(result[1].outcome, "Trade");
  assertEquals(result[1].playerHealth, 9);
  assertEquals(result[1].cpuHealth, 9);
});

Deno.test("compareNode should handle a dodge (Crouch vs Kick)", async () => {
  const initialState: State = {
    playerHealth: 5,
    cpuHealth: 10,
    playerMove: "crouch",
    cpuMove: "kick",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[1].outcome, "Dodge");
  assertEquals(result[1].playerHealth, 6); // Heal 1
  assertEquals(result[1].cpuHealth, 10);
});

Deno.test("compareNode should handle a miss (Kick vs Crouch)", async () => {
  const initialState: State = {
    playerHealth: 10,
    cpuHealth: 5,
    playerMove: "kick",
    cpuMove: "crouch",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[1].outcome, "Miss");
  assertEquals(result[1].playerHealth, 10);
  assertEquals(result[1].cpuHealth, 6); // Heal 1
});

Deno.test("compareNode should handle a chip (Kick vs Jump)", async () => {
  const initialState: State = {
    playerHealth: 10,
    cpuHealth: 10,
    playerMove: "kick",
    cpuMove: "jump",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[1].outcome, "Chip");
  assertEquals(result[1].cpuHealth, 9);
});

Deno.test("compareNode should handle an ouch (Jump vs Kick)", async () => {
  const initialState: State = {
    playerHealth: 10,
    cpuHealth: 10,
    playerMove: "jump",
    cpuMove: "kick",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[1].outcome, "Ouch");
  assertEquals(result[1].playerHealth, 9);
});

Deno.test("compareNode should handle a draw (Block vs Jump)", async () => {
  const initialState: State = {
    playerHealth: 10,
    cpuHealth: 10,
    playerMove: "block",
    cpuMove: "jump",
    outcome: null,
  };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onSuccess: "result" }, utils)(initialState);

  assertEquals(result[1].outcome, "Draw");
  assertEquals(result[1].playerHealth, 10);
  assertEquals(result[1].cpuHealth, 10);
});
