import { factory, State } from "../game-start.ts";
import { assertEquals } from "@std/assert";

Deno.test("game-start should pick a word and reset state", async () => {
  const initialState: State = {
    word: "previous",
    revealed: [true],
    wrongGuesses: 3,
    maxWrong: 6,
    guessedLetters: ["a", "b"],
    gameOver: true,
  };

  const result = await factory({ onReady: "display" })(initialState);

  assertEquals(result[0], "display");
  assertEquals(result[1].word.length, result[1].revealed.length);
  assertEquals(result[1].wrongGuesses, 0);
  assertEquals(result[1].maxWrong, 6);
  assertEquals(result[1].guessedLetters.length, 0);
  assertEquals(result[1].gameOver, false);
});

Deno.test("game-start should print a new game message", async () => {
  let capturedMsg = "";
  const utils = { print: (msg: string) => { capturedMsg = msg; } };
  const initialState: State = {
    word: "test", revealed: [], wrongGuesses: 0, maxWrong: 5,
    guessedLetters: [], gameOver: false,
  };

  await factory({ onReady: "display" }, utils)(initialState);
  assertEquals(capturedMsg, "\n=== New Game: guess the word! ===");
});
