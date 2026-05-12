import { assertEquals } from "@std/assert";
import { factory, State } from "../determineResult.ts";

Deno.test(
  "determineResult should return Tie when both choices are the same",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "rock",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Tie");
  },
);

Deno.test(
  "determineResult should return Win when user wins with rock vs scissors",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "scissors",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Win");
  },
);

Deno.test(
  "determineResult should return Win when user wins with paper vs rock",
  async () => {
    const initialState: State = {
      userChoice: "paper",
      computerChoice: "rock",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Win");
  },
);

Deno.test(
  "determineResult should return Win when user wins with scissors vs paper",
  async () => {
    const initialState: State = {
      userChoice: "scissors",
      computerChoice: "paper",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Win");
  },
);

Deno.test(
  "determineResult should return Loss when user loses with rock vs paper",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: "paper",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Loss");
  },
);

Deno.test(
  "determineResult should return Loss when user loses with paper vs scissors",
  async () => {
    const initialState: State = {
      userChoice: "paper",
      computerChoice: "scissors",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Loss");
  },
);

Deno.test(
  "determineResult should return Loss when user loses with scissors vs rock",
  async () => {
    const initialState: State = {
      userChoice: "scissors",
      computerChoice: "rock",
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Loss");
  },
);

Deno.test(
  "determineResult should return Invalid when choices are missing",
  async () => {
    const initialState: State = {
      userChoice: null,
      computerChoice: null,
      result: null,
    };

    const result = await factory({ onComplete: "next" })(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].result, "Invalid");
  },
);
