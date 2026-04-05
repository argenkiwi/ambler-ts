import { assertEquals, assertExists } from "@std/assert";
import { start } from "./start.ts";
import { State } from "../state.ts";
import { Nextable } from "../ambler.ts";

const baseState: State = { count: 0 };

function makeEdges(onCount: Nextable<State>, onInvalid: Nextable<State>) {
  return { onCount, onInvalid };
}

function capture(): { fn: Nextable<State>; state: State | undefined } {
  const result: { fn: Nextable<State>; state: State | undefined } = {
    state: undefined,
    fn: async (s) => { result.state = s; return null; },
  };
  return result;
}

Deno.test("start: empty input uses default count of 0 and goes to count", async () => {
  const onCount = capture();
  const onInvalid = capture();

  const next = await start(
    makeEdges(onCount.fn, onInvalid.fn),
    { prompt: async () => "", print: () => {} },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(onCount.state?.count, 0);
  assertEquals(onInvalid.state, undefined);
});

Deno.test("start: valid integer input sets count and goes to count", async () => {
  const onCount = capture();
  const onInvalid = capture();

  const next = await start(
    makeEdges(onCount.fn, onInvalid.fn),
    { prompt: async () => "42", print: () => {} },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(onCount.state?.count, 42);
  assertEquals(onInvalid.state, undefined);
});

Deno.test("start: invalid input prints error and goes to onInvalid", async () => {
  const onCount = capture();
  const onInvalid = capture();
  const printed: string[] = [];

  const next = await start(
    makeEdges(onCount.fn, onInvalid.fn),
    { prompt: async () => "abc", print: (m) => printed.push(m) },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(onCount.state, undefined);
  assertExists(onInvalid.state);
  assertEquals(printed.length, 1);
});

Deno.test("start: negative integer is valid", async () => {
  const onCount = capture();
  const onInvalid = capture();

  const next = await start(
    makeEdges(onCount.fn, onInvalid.fn),
    { prompt: async () => "-5", print: () => {} },
  )(baseState);

  assertExists(next);
  await next!.run();

  assertEquals(onCount.state?.count, -5);
});
