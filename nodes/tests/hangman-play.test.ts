import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../hangman-play.ts";

const baseState: State = { word: "", guessed: [], won: false };

function makeUtils(word: string, keys: string[]): Utils {
  let i = 0;
  const printed: string[] = [];
  return {
    print: (msg) => printed.push(msg),
    clearScreen: () => {},
    readKey: async () => keys[i++] ?? null,
    pickWord: () => word,
  };
}

Deno.test("hangman-play: Escape transitions to onExit", async () => {
  const result = await factory(
    { onGameOver: "GAME_OVER", onExit: null },
    makeUtils("cat", ["\x1b"]),
  )(baseState);

  assertEquals(result[0], null);
});

Deno.test("hangman-play: guessing all letters wins", async () => {
  // word = "cat", guess c, a, t
  const result = await factory(
    { onGameOver: "GAME_OVER", onExit: null },
    makeUtils("cat", ["c", "a", "t"]),
  )(baseState);

  assertEquals(result[0], "GAME_OVER");
  assertEquals(result[1].word, "cat");
  assertEquals(result[1].won, true);
  assertEquals([...result[1].guessed].sort(), ["a", "c", "t"]);
});

Deno.test("hangman-play: 6 wrong guesses loses", async () => {
  // word = "cat", guess 6 wrong letters
  const result = await factory(
    { onGameOver: "GAME_OVER", onExit: null },
    makeUtils("cat", ["b", "d", "e", "f", "g", "h"]),
  )(baseState);

  assertEquals(result[0], "GAME_OVER");
  assertEquals(result[1].word, "cat");
  assertEquals(result[1].won, false);
});

Deno.test("hangman-play: already-guessed letters are ignored", async () => {
  // word = "cat", guess c twice, then a, t
  const result = await factory(
    { onGameOver: "GAME_OVER", onExit: null },
    makeUtils("cat", ["c", "c", "a", "t"]),
  )(baseState);

  assertEquals(result[0], "GAME_OVER");
  assertEquals(result[1].won, true);
  // "c" appears once despite being guessed twice
  assertEquals(result[1].guessed.filter((l) => l === "c").length, 1);
});

Deno.test("hangman-play: case-insensitive input", async () => {
  const result = await factory(
    { onGameOver: "GAME_OVER", onExit: null },
    makeUtils("cat", ["C", "A", "T"]),
  )(baseState);

  assertEquals(result[0], "GAME_OVER");
  assertEquals(result[1].won, true);
});

Deno.test("hangman-play: state includes correct guessed array and word", async () => {
  const result = await factory(
    { onGameOver: "GAME_OVER", onExit: null },
    makeUtils("hi", ["h", "i"]),
  )(baseState);

  assertEquals(result[1].word, "hi");
  assertEquals(result[1].guessed.sort(), ["h", "i"]);
  assertEquals(result[1].won, true);
});
