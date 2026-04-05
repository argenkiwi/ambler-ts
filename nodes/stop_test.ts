import { assertEquals } from "@std/assert";
import { stop } from "./stop.ts";
import { State } from "../state.ts";

const baseState: State = { count: 10 };

Deno.test("stop: prints final count and returns null", async () => {
  const printed: string[] = [];

  const result = await stop(
    { print: (m) => printed.push(m) },
  )(baseState);

  assertEquals(result, null);
  assertEquals(printed[0], "Final count: 10");
});

Deno.test("stop: displays correct count", async () => {
  const printed: string[] = [];

  await stop({ print: (m) => printed.push(m) })({ count: 42 });

  assertEquals(printed[0], "Final count: 42");
});
