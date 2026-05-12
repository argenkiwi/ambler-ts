import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../playAgain.ts";

Deno.test("playAgainNode should reset state and return onPlayAgain when user says yes", async () => {
  const initialState: State = {
    userChoice: "rock",
    computerChoice: "paper",
    result: "Computer wins!",
  };

  const utils: Utils = {
    readLine: async (_msg: string) => true,
    print: (_msg: string) => {},
  };

  const [edge, state] = await factory(
    { onPlayAgain: "start", onQuit: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "start");
  assertEquals(state.userChoice, null);
  assertEquals(state.computerChoice, null);
  assertEquals(state.result, null);
});

Deno.test("playAgainNode should return onQuit and print message when user says no", async () => {
  const initialState: State = {
    userChoice: "rock",
    computerChoice: "paper",
    result: "Computer wins!",
  };

  let printedMessage = "";
  const utils: Utils = {
    readLine: async (_msg: string) => false,
    print: (msg: string) => {
      printedMessage = msg;
    },
  };

  const [edge, state] = await factory(
    { onPlayAgain: "start", onQuit: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "stop");
  assertEquals(state, initialState);
  assertEquals(printedMessage, "Thanks for playing!");
});
