import { assertEquals } from "@std/assert";
import { walk } from "../../ambler.ts";
import { createWalk } from "../counter.ts";

/** Plays back typed lines and coin flips, and records everything printed. */
function script(lines: (string | null)[], flips: boolean[]) {
  const printed: string[] = [];
  const print = (msg: string) => {
    printed.push(msg);
  };
  return {
    printed,
    utils: {
      start: { readLine: () => lines.shift() ?? null, print },
      count: {
        print,
        sleep: () => Promise.resolve(),
        random: () => (flips.shift() ? 1 : 0),
      },
      stop: { print },
    },
  };
}

Deno.test("counter retries invalid input, then counts until the coin says stop", async () => {
  const { printed, utils } = script(["abc", "3"], [true, false]);

  const final = await walk(createWalk(utils), "START", { count: 99 });

  assertEquals(final.count, 5);
  assertEquals(printed, [
    "Error: Invalid input. Please enter a number.",
    "Current count: 3",
    "Current count: 4",
    "Final count: 5",
  ]);
});

Deno.test("counter starts from 0 at end of input", async () => {
  const { printed, utils } = script([null], [false]);

  const final = await walk(createWalk(utils), "START", { count: 99 });

  assertEquals(final.count, 1);
  assertEquals(printed, ["Current count: 0", "Final count: 1"]);
});
