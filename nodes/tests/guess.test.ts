import { factory, State } from "../guess.ts";
import { assertEquals, assert } from "@std/assert";

Deno.test("guess should accept a valid new letter", async () => {
  const initialState: State = {
    word: "cat", revealed: [false, false, false], wrongGuesses: 0,
    maxWrong: 6, guessedLetters: [], gameOver: false,
    };

  const utils = {
    readLine: (_msg: string) => "t",
    print: (_msg: string) => {},
    };

  const result = await factory({ onValid: "check", onInvalid: "guess" }, utils)(initialState);
  assertEquals(result[0], "check");
  assertEquals(result[1].guessedLetters, ["t"]);
});

Deno.test("guess should reject an empty input", async () => {
  const initialState: State = {
    word: "cat", revealed: [false, false, false], wrongGuesses: 0,
    maxWrong: 6, guessedLetters: [], gameOver: false,
    };

  let warning = "";
  const utils = {
    readLine: (_msg: string) => "",
    print: (msg: string) => { warning = msg; },
    };

  const result = await factory({ onValid: "check", onInvalid: "guess" }, utils)(initialState);
  assertEquals(result[0], "guess");
  assertEquals(result[1].guessedLetters, []);
  assert(warning.includes("single letter"), "Should warn about single letter requirement");
});

Deno.test("guess should reject a non-letter input", async () => {
  const initialState: State = {
    word: "cat", revealed: [false, false, false], wrongGuesses: 0,
    maxWrong: 6, guessedLetters: [], gameOver: false,
    };

  let warning = "";
  const utils = {
    readLine: (_msg: string) => "5",
    print: (msg: string) => { warning = msg; },
    };

  const result = await factory({ onValid: "check", onInvalid: "guess" }, utils)(initialState);
  assertEquals(result[0], "guess");
  assertEquals(result[1].guessedLetters, []);
  assert(warning.includes("alphabetic"), "Should warn about alphabetic requirement");
});

Deno.test("guess should reject an already-guessed letter", async () => {
  const initialState: State = {
    word: "cat", revealed: [false, true, false], wrongGuesses: 0,
    maxWrong: 6, guessedLetters: ["a"], gameOver: false,
    };

  let warning = "";
  const utils = {
    readLine: (_msg: string) => "a",
    print: (msg: string) => { warning = msg; },
    };

  const result = await factory({ onValid: "check", onInvalid: "guess" }, utils)(initialState);
  assertEquals(result[0], "guess");
  assertEquals(result[1].guessedLetters, ["a"]);
  assert(warning.includes("already guessed"), "Should warn about already guessed letter");
});
