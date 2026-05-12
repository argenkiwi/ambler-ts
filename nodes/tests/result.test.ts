import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../result.ts";

Deno.test("resultNode should transition to onContinue when both players have health", async () => {
  const initialState: State = { playerHealth: 10, cpuHealth: 10 };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onContinue: "playerChoice", onGameOver: "playAgain" }, utils)(initialState);

  assertEquals(result[0], "playerChoice");
});

Deno.test("resultNode should transition to onGameOver when player health is 0", async () => {
  const initialState: State = { playerHealth: 0, cpuHealth: 10 };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onContinue: "playerChoice", onGameOver: "playAgain" }, utils)(initialState);

  assertEquals(result[0], "playAgain");
});

Deno.test("resultNode should transition to onGameOver when CPU health is 0", async () => {
  const initialState: State = { playerHealth: 10, cpuHealth: 0 };
  const utils: Utils = { print: () => {} };

  const result = await factory({ onContinue: "playerChoice", onGameOver: "playAgain" }, utils)(initialState);

  assertEquals(result[0], "playAgain");
});
