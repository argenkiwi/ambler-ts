import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../check-condition.ts";

Deno.test("check-conditionNode should continue if not win or loss", async () => {
  const initialState: State = {
    messages: [
      { role: "assistant", content: "Is it alive?" },
      { role: "user", content: "yes" },
    ],
    questionCount: 1,
    guessCount: 0,
  };

  const utils: Utils = { print: (_msg: string) => {} };

  const result = await factory(
    { onContinue: "cont", onWin: "win", onLoss: "loss" },
    utils,
  )(initialState);

  assertEquals(result[0], "cont");
});

Deno.test("check-conditionNode should win if explicit keyword used", async () => {
  const initialState: State = {
    messages: [
      { role: "assistant", content: "Is the answer a cat?" },
      { role: "user", content: "Yes! That's it!" },
    ],
    questionCount: 5,
    guessCount: 1,
  };

  const utils: Utils = { print: (_msg: string) => {} };

  const result = await factory(
    { onContinue: "cont", onWin: "win", onLoss: "loss" },
    utils,
  )(initialState);

  assertEquals(result[0], "win");
  assertEquals(result[1].outcome, "win");
});

Deno.test("check-conditionNode should lose if questionCount reaches 20", async () => {
  const initialState: State = {
    messages: [
      { role: "assistant", content: "Is it alive?" },
      { role: "user", content: "no" },
    ],
    questionCount: 20,
    guessCount: 0,
  };

  const utils: Utils = { print: (_msg: string) => {} };

  const result = await factory(
    { onContinue: "cont", onWin: "win", onLoss: "loss" },
    utils,
  )(initialState);

  assertEquals(result[0], "loss");
  assertEquals(result[1].outcome, "loss");
});

Deno.test("check-conditionNode should lose if 3rd guess is incorrect", async () => {
  const initialState: State = {
    messages: [
      { role: "assistant", content: "Is the answer a dog?" },
      { role: "user", content: "no" },
    ],
    questionCount: 10,
    guessCount: 3,
  };

  const utils: Utils = { print: (_msg: string) => {} };

  const result = await factory(
    { onContinue: "cont", onWin: "win", onLoss: "loss" },
    utils,
  )(initialState);

  assertEquals(result[0], "loss");
  assertEquals(result[1].outcome, "loss");
});

Deno.test("check-conditionNode should continue if 1st guess is incorrect and questions remain", async () => {
  const initialState: State = {
    messages: [
      { role: "assistant", content: "Is the answer a bird?" },
      { role: "user", content: "no" },
    ],
    questionCount: 10,
    guessCount: 1,
  };

  const utils: Utils = { print: (_msg: string) => {} };

  const result = await factory(
    { onContinue: "cont", onWin: "win", onLoss: "loss" },
    utils,
  )(initialState);

  assertEquals(result[0], "cont");
});
