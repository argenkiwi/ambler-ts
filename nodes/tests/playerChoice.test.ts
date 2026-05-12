import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../playerChoice.ts";

Deno.test("playerChoiceNode should transition to onSuccess when input is valid", async () => {
  const initialState: State = { playerHealth: 10, cpuHealth: 10, playerMove: null };
  const utils: Utils = {
    print: () => {},
    readLine: () => "k",
  };

  const result = await factory({ onSuccess: "computerChoice", onError: "playerChoice" }, utils)(initialState);

  assertEquals(result[0], "computerChoice");
  assertEquals(result[1].playerMove, "kick");
});

Deno.test("playerChoiceNode should transition to onError when input is invalid", async () => {
  const initialState: State = { playerHealth: 10, cpuHealth: 10, playerMove: null };
  const utils: Utils = {
    print: () => {},
    readLine: () => "invalid",
  };

  const result = await factory({ onSuccess: "computerChoice", onError: "playerChoice" }, utils)(initialState);

  assertEquals(result[0], "playerChoice");
  assertEquals(result[1].playerMove, null);
});
