import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../computeChoice.ts";

Deno.test(
  "computeChoice should select rock when random returns 0",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      random: () => 0,
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].computerChoice, "rock");
  },
);

Deno.test(
  "computeChoice should select paper when random returns 0.33",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      random: () => 0.4,
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].computerChoice, "paper");
  },
);

Deno.test(
  "computeChoice should select scissors when random returns 0.66",
  async () => {
    const initialState: State = {
      userChoice: "rock",
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      random: () => 0.7,
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].computerChoice, "scissors");
  },
);

Deno.test(
  "computeChoice should not modify userChoice",
  async () => {
    const initialState: State = {
      userChoice: "scissors",
      computerChoice: null,
      result: null,
    };

    const utils: Utils = {
      random: () => 0.5,
    };

    const result = await factory({ onComplete: "next" }, utils)(initialState);

    assertEquals(result[1].userChoice, "scissors");
  },
);
