import { factory, State } from "../win.ts";
import { assert, assertEquals } from "@std/assert";

Deno.test("win should display congratulations with word and wrong guesses", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [true, true, true],
    wrongGuesses: 2,
    maxWrong: 6,
    guessedLetters: ["a", "t", "c"],
    gameOver: true,
  };

  let captured = "";
  const utils = {
    print: (msg: string) => {
      captured += msg + "\n";
    },
  };

  const result = await factory({ onWin: "replay" }, utils)(initialState);
  assertEquals(result[0], "replay");
  assert(captured.includes("Congratulations"), "Should show congratulations");
  assert(captured.includes("cat"), "Should reveal the word");
  assert(
    captured.includes("Wrong guesses: 2/6"),
    "Should show wrong guess count",
  );
});
