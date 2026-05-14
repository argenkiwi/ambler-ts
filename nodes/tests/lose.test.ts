import { factory, State } from "../lose.ts";
import { assertEquals, assert } from "@std/assert";

Deno.test("lose should display game over message with secret word", async () => {
  const initialState: State = {
    word: "dog",
    revealed: [false, true, false],
    wrongGuesses: 6,
    maxWrong: 6,
    guessedLetters: ["a", "o"],
    gameOver: true,
    };

  let captured = "";
  const utils = { print: (msg: string) => { captured += msg + "\n"; } };

  const result = await factory({ onLose: "replay" }, utils)(initialState);
  assertEquals(result[0], "replay");
  assert(captured.includes("Game over"), "Should show game over message");
  assert(captured.includes("dog"), "Should reveal the secret word");
  assert(captured.includes("Wrong guesses: 6/6"), "Should show wrong guess count");
  assert(captured.includes("_ o _"), "Should show partially revealed word");
});
