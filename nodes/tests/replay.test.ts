import { factory, State } from "../replay.ts";
import { assertEquals } from "@std/assert";

Deno.test("replay should transition to game-start when user says y", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [true, true, true],
    wrongGuesses: 1,
    maxWrong: 6,
    guessedLetters: ["c", "a", "t"],
    gameOver: true,
  };

  const utils = {
    readLine: (_msg: string) => "y",
    print: (_msg: string) => {},
  };

  const result = await factory({
    onContinue: "game-start",
    onQuit: "terminate",
  }, utils)(initialState);
  assertEquals(result[0], "game-start");
});

Deno.test("replay should transition to game-start when user says yes", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [true, true, true],
    wrongGuesses: 1,
    maxWrong: 6,
    guessedLetters: ["c", "a", "t"],
    gameOver: true,
  };

  const utils = {
    readLine: (_msg: string) => "yes",
    print: (_msg: string) => {},
  };

  const result = await factory({
    onContinue: "game-start",
    onQuit: "terminate",
  }, utils)(initialState);
  assertEquals(result[0], "game-start");
});

Deno.test("replay should transition to terminate when user declines", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [true, true, true],
    wrongGuesses: 1,
    maxWrong: 6,
    guessedLetters: ["c", "a", "t"],
    gameOver: true,
  };

  const utils = {
    readLine: (_msg: string) => "n",
    print: (_msg: string) => {},
  };

  const result = await factory({
    onContinue: "game-start",
    onQuit: "terminate",
  }, utils)(initialState);
  assertEquals(result[0], "terminate");
});
