import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../playAgain.ts";

Deno.test(
  "playAgain should transition to onPlayAgain when user enters yes",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: "Loss",
    };

    const utils: Utils = {
      readLine: (_msg: string) => "yes",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onPlayAgain: "start", onQuit: "end" },
      utils,
    )(initialState);

    assertEquals(result[0], "start");
    assertEquals(result[1].userChoice, null);
    assertEquals(result[1].computerChoice, null);
    assertEquals(result[1].result, null);
  },
);

Deno.test(
  "playAgain should transition to onPlayAgain when user enters y",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: "Loss",
    };

    const utils: Utils = {
      readLine: (_msg: string) => "y",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onPlayAgain: "start", onQuit: "end" },
      utils,
    )(initialState);

    assertEquals(result[0], "start");
  },
);

Deno.test(
  "playAgain should transition to onPlayAgain when input is null",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: "Loss",
    };

    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onPlayAgain: "start", onQuit: "end" },
      utils,
    )(initialState);

    assertEquals(result[0], "start");
  },
);

Deno.test(
  "playAgain should transition to onQuit when user enters no",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: "Loss",
    };

    const printed: string[] = [];
    const utils: Utils = {
      readLine: (_msg: string) => "no",
      print: (msg: string) => printed.push(msg),
    };

    const result = await factory(
      { onPlayAgain: "start", onQuit: "end" },
      utils,
    )(initialState);

    assertEquals(result[0], "end");
    assertEquals(printed[0], "Thanks for playing!");
  },
);

Deno.test(
  "playAgain should transition to onQuit when user enters anything other than yes/y",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: "Loss",
    };

    const utils: Utils = {
      readLine: (_msg: string) => "maybe",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onPlayAgain: "start", onQuit: "end" },
      utils,
    )(initialState);

    assertEquals(result[0], "end");
  },
);
