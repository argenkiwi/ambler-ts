import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../rpsStart.ts";

Deno.test(
  "rpsStart should transition to onSuccess with valid Rock input",
  async () => {
    const initialState: State = {
      userChoice: null,
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      selectChoice: (_msg: string) => Promise.resolve("rock"),
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].userChoice, "rock");
  },
);

Deno.test(
  "rpsStart should transition to onSuccess with valid Paper input",
  async () => {
    const initialState: State = {
      userChoice: null,
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      selectChoice: (_msg: string) => Promise.resolve("paper"),
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].userChoice, "paper");
  },
);

Deno.test(
  "rpsStart should transition to onSuccess with valid Scissors input",
  async () => {
    const initialState: State = {
      userChoice: null,
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      selectChoice: (_msg: string) => Promise.resolve("scissors"),
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].userChoice, "scissors");
  },
);

Deno.test(
  "rpsStart should transition to onError with invalid input",
  async () => {
    const initialState: State = {
      userChoice: null,
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      selectChoice: (_msg: string) => Promise.resolve("lizard"),
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "error");
    assertEquals(result[1].userChoice, null);
  },
);

Deno.test(
  "rpsStart should transition to onError when input is null",
  async () => {
    const initialState: State = {
      userChoice: null,
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      selectChoice: (_msg: string) => Promise.resolve(null),
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "error");
    assertEquals(result[1].userChoice, null);
  },
);
