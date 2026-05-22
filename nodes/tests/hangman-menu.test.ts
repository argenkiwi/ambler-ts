import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../hangman-menu.ts";

const baseState: State = { word: "", guessed: [], won: false };

function makeUtils(keys: string[]): Utils {
  let i = 0;
  return {
    print: () => {},
    clearScreen: () => {},
    readKey: async () => keys[i++] ?? null,
  };
}

Deno.test("hangman-menu: Enter transitions to onPlay", async () => {
  const result = await factory(
    { onPlay: "PLAY", onExit: null },
    makeUtils(["\r"]),
  )(baseState);

  assertEquals(result[0], "PLAY");
  assertEquals(result[1], baseState);
});

Deno.test("hangman-menu: Escape transitions to onExit", async () => {
  const result = await factory(
    { onPlay: "PLAY", onExit: null },
    makeUtils(["\x1b"]),
  )(baseState);

  assertEquals(result[0], null);
  assertEquals(result[1], baseState);
});

Deno.test("hangman-menu: other keys are ignored until Enter", async () => {
  const result = await factory(
    { onPlay: "PLAY", onExit: null },
    makeUtils(["a", "b", " ", "\r"]),
  )(baseState);

  assertEquals(result[0], "PLAY");
});
