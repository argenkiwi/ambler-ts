import { factory, State } from "../terminate.ts";
import { assertEquals } from "@std/assert";

Deno.test("terminate should print farewell and return null", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [true, true, true],
    wrongGuesses: 1,
    maxWrong: 6,
    guessedLetters: ["c", "a", "t"],
    gameOver: true,
  };

  let capturedMsg = "";
  const utils = {
    print: (msg: string) => {
      capturedMsg = msg;
    },
  };

  const result = await factory({ onDone: null }, utils)(initialState);
  assertEquals(result[0], null);
  assertEquals(capturedMsg, "Thanks for playing Hangman! Goodbye!");
});
