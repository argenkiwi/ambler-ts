import { assertEquals, assertExists } from "@std/assert";
import { count } from "./count.ts";
import { State } from "../state.ts";
import { Nextable } from "../ambler.ts";

const baseState: State = { count: 5 };

function capture(): { fn: Nextable<State>; state: State | undefined } {
  const result: { fn: Nextable<State>; state: State | undefined } = {
    state: undefined,
    fn: async (s) => { result.state = s; return null; },
  };
  return result;
}

Deno.test("count: prints current count and increments state", async () => {
  const onCount = capture();
  const onStop = capture();
  const printed: string[] = [];

  const next = await count(
    { onCount: onCount.fn, onStop: onStop.fn },
    { print: (m) => printed.push(m), sleep: async () => {}, random: () => 0 },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(printed[0], "Count: 5");
  // random() = 0 < 0.5 → onStop
  assertEquals(onStop.state?.count, 6);
  assertEquals(onCount.state, undefined);
});

Deno.test("count: goes to onCount when random >= 0.5", async () => {
  const onCount = capture();
  const onStop = capture();

  const next = await count(
    { onCount: onCount.fn, onStop: onStop.fn },
    { print: () => {}, sleep: async () => {}, random: () => 0.9 },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(onCount.state?.count, 6);
  assertEquals(onStop.state, undefined);
});

Deno.test("count: goes to onStop when random < 0.5", async () => {
  const onCount = capture();
  const onStop = capture();

  const next = await count(
    { onCount: onCount.fn, onStop: onStop.fn },
    { print: () => {}, sleep: async () => {}, random: () => 0.3 },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(onStop.state?.count, 6);
  assertEquals(onCount.state, undefined);
});

Deno.test("count: calls sleep with 1000ms", async () => {
  let sleptMs = 0;

  await count(
    { onCount: async () => null, onStop: async () => null },
    { print: () => {}, sleep: async (ms) => { sleptMs = ms; }, random: () => 0 },
  )(baseState);

  assertEquals(sleptMs, 1000);
});
