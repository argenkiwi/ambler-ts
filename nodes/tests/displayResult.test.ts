import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../displayResult.ts";

Deno.test(
  "displayResult should display a Tie result correctly",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "rock",
      result: "Tie",
    };

    const printed: string[] = [];
    const utils: Utils = {
      print: (msg: string) => printed.push(msg),
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[0], "next");
    assertEquals(printed[0], "You chose: Rock");
    assertEquals(printed[1], "Computer chose: Rock");
    assertEquals(printed[2], "Result: It's a Tie!");
  },
);

Deno.test(
  "displayResult should display a Win result correctly",
  async () => {
    const initialState: State = {
      userChoice: "paper",
      computerChoice: "rock",
      result: "Win",
    };

    const printed: string[] = [];
    const utils: Utils = {
      print: (msg: string) => printed.push(msg),
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[0], "next");
    assertEquals(printed[0], "You chose: Paper");
    assertEquals(printed[1], "Computer chose: Rock");
    assertEquals(printed[2], "Result: You Win!");
  },
);

Deno.test(
  "displayResult should display a Loss result correctly",
  async () => {
    const initialState: State = {
      userChoice: "scissors",
      computerChoice: "rock",
      result: "Loss",
    };

    const printed: string[] = [];
    const utils: Utils = {
      print: (msg: string) => printed.push(msg),
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[0], "next");
    assertEquals(printed[0], "You chose: Scissors");
    assertEquals(printed[1], "Computer chose: Rock");
    assertEquals(printed[2], "Result: You Lose!");
  },
);

Deno.test(
  "displayResult should not modify state",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: "Loss",
    };

    const utils: Utils = {
      print: (_msg: string) => {},
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[1].userChoice, "rock");
    assertEquals(result[1].computerChoice, "paper");
    assertEquals(result[1].result, "Loss");
  },
);
