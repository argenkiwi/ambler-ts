import { factory, State } from "../check.ts";
import { assertEquals } from "@std/assert";

Deno.test("check should reveal correct letter and transition to continue", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [false, false, false],
    wrongGuesses: 0,
    maxWrong: 6,
    guessedLetters: ["t"],
    gameOver: false,
  };

  const utils = { print: (_msg: string) => {} };

  const result = await factory({
    onWin: "win",
    onLose: "lose",
    onContinue: "display",
  }, utils)(initialState);
  assertEquals(result[0], "display");
  assertEquals(result[1].revealed, [false, false, true]);
  assertEquals(result[1].wrongGuesses, 0);
});

Deno.test("check should increment wrong guesses for incorrect letter", async () => {
  const initialState: State = {
    word: "dog",
    revealed: [false, false, false],
    wrongGuesses: 2,
    maxWrong: 6,
    guessedLetters: ["x", "q", "z"],
    gameOver: false,
  };

  let msg = "";
  const utils = {
    print: (m: string) => {
      msg = m;
    },
  };

  const result = await factory({
    onWin: "win",
    onLose: "lose",
    onContinue: "display",
  }, utils)(initialState);
  assertEquals(result[0], "display");
  assertEquals(result[1].wrongGuesses, 3);
  assertEquals(result[1].revealed, [false, false, false]);
  assertEquals(msg, "'z' is not in the word.");
});

Deno.test("check should transition to win when all letters revealed", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [false, true, true],
    wrongGuesses: 1,
    maxWrong: 6,
    guessedLetters: ["a", "t", "c"],
    gameOver: false,
  };

  const utils = { print: (_msg: string) => {} };

  const result = await factory({
    onWin: "win",
    onLose: "lose",
    onContinue: "display",
  }, utils)(initialState);
  assertEquals(result[0], "win");
  assertEquals(result[1].revealed, [true, true, true]);
  assertEquals(result[1].gameOver, true);
});

Deno.test("check should transition to lose when max wrong guesses reached", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [false, true, false],
    wrongGuesses: 5,
    maxWrong: 6,
    guessedLetters: ["a", "b", "d", "e", "f", "z"],
    gameOver: false,
  };

  const utils = { print: (_msg: string) => {} };

  const result = await factory({
    onWin: "win",
    onLose: "lose",
    onContinue: "display",
  }, utils)(initialState);
  assertEquals(result[0], "lose");
  assertEquals(result[1].wrongGuesses, 6);
  assertEquals(result[1].gameOver, true);
});

Deno.test("check should reveal all instances of a repeated letter", async () => {
  const initialState: State = {
    word: "banana",
    revealed: [false, false, false, false, false, false],
    wrongGuesses: 0,
    maxWrong: 6,
    guessedLetters: ["a"],
    gameOver: false,
  };

  const utils = { print: (_msg: string) => {} };

  const result = await factory({
    onWin: "win",
    onLose: "lose",
    onContinue: "display",
  }, utils)(initialState);
  assertEquals(result[0], "display");
  assertEquals(result[1].revealed, [false, true, false, true, false, true]);
});
