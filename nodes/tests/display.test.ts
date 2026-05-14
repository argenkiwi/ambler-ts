import { factory, State, renderWord, renderHangman } from "../display.ts";
import { assertEquals, assert } from "@std/assert";

Deno.test("renderWord should show underscores for unrevealed letters", () => {
  assertEquals(renderWord("cat", [false, true, false]), "_ a _");
});

Deno.test("renderWord should show all letters when fully revealed", () => {
  assertEquals(renderWord("dog", [true, true, true]), "d o g");
});

Deno.test("renderHangman should show empty gallows at 0 wrong guesses", () => {
  const diagram = renderHangman(0);
  assert(!diagram.includes("O"), "Empty gallows should not have an O");
});

Deno.test("renderHangman should show head at 1 wrong guess", () => {
  const diagram = renderHangman(1);
  assert(diagram.includes("O"), "Gallows should have an O at 1 wrong guess");
});

Deno.test("display should transition to onDisplay with unchanged state", async () => {
  const initialState: State = {
    word: "cat",
    revealed: [true, false, true],
    wrongGuesses: 1,
    maxWrong: 6,
    guessedLetters: ["a"],
    gameOver: false,
    };

  let printedOutput = "";
  const utils = { print: (msg: string) => { printedOutput += msg + "\n"; } };

  const result = await factory({ onDisplay: "input" }, utils)(initialState);
  assertEquals(result[0], "input");
  assertEquals(result[1].word, "cat");
  assert(printedOutput.includes("c _ t"), "Should show revealed word");
  assert(printedOutput.includes("a"), "Should show guessed letters");
  assert(printedOutput.includes("Wrong: 1/6"), "Should show wrong guess count");
});
