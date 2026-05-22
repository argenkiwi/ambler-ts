import { assertEquals, assertStringIncludes } from "@std/assert";
import { factory, State, Utils } from "../hangman-game-over.ts";

function makeUtils(keys: string[]): { utils: Utils; output: string[] } {
  let i = 0;
  const output: string[] = [];
  const utils: Utils = {
    print: (msg) => output.push(msg),
    clearScreen: () => {},
    readKey: async () => keys[i++] ?? null,
  };
  return { utils, output };
}

Deno.test("hangman-game-over: Enter transitions to onPlayAgain", async () => {
  const state: State = { word: "cat", guessed: ["c", "a", "t"], won: true };
  const { utils } = makeUtils(["\r"]);

  const result = await factory(
    { onPlayAgain: "MENU", onExit: null },
    utils,
  )(state);

  assertEquals(result[0], "MENU");
  assertEquals(result[1], state);
});

Deno.test("hangman-game-over: Escape transitions to onExit", async () => {
  const state: State = { word: "cat", guessed: ["c", "a", "t"], won: true };
  const { utils } = makeUtils(["\x1b"]);

  const result = await factory(
    { onPlayAgain: "MENU", onExit: null },
    utils,
  )(state);

  assertEquals(result[0], null);
});

Deno.test("hangman-game-over: shows 'You win!' on victory", async () => {
  const state: State = { word: "cat", guessed: ["c", "a", "t"], won: true };
  const { utils, output } = makeUtils(["\r"]);

  await factory({ onPlayAgain: "MENU", onExit: null }, utils)(state);

  assertStringIncludes(output.join("\n"), "You win!");
});

Deno.test("hangman-game-over: shows 'You lose...' and answer on defeat", async () => {
  const state: State = {
    word: "cat",
    guessed: ["b", "d", "e", "f", "g", "h"],
    won: false,
  };
  const { utils, output } = makeUtils(["\r"]);

  await factory({ onPlayAgain: "MENU", onExit: null }, utils)(state);

  const joined = output.join("\n");
  assertStringIncludes(joined, "You lose...");
  assertStringIncludes(joined, "cat");
});

Deno.test("hangman-game-over: reveals full word", async () => {
  const state: State = {
    word: "hello",
    guessed: ["h", "e", "l", "o"],
    won: true,
  };
  const { utils, output } = makeUtils(["\r"]);

  await factory({ onPlayAgain: "MENU", onExit: null }, utils)(state);

  assertStringIncludes(output.join("\n"), "h e l l o");
});

Deno.test("hangman-game-over: other keys are ignored until Enter", async () => {
  const state: State = { word: "cat", guessed: ["c", "a", "t"], won: true };
  const { utils } = makeUtils(["x", "y", "\r"]);

  const result = await factory(
    { onPlayAgain: "MENU", onExit: null },
    utils,
  )(state);

  assertEquals(result[0], "MENU");
});
