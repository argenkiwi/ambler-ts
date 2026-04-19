import { assertEquals } from "@std/assert";
import * as CountNode from "./countNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test(
  "countNode should increment count and transition to onCount if random > 0.5",
  async () => {
    const initialState: CountNode.State = { count: 5 };
    let capturedState: CountNode.State | undefined;
    const captureNext: Nextable<CountNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: CountNode.Utils = {
      print: () => {},
      sleep: async () => {},
      random: () => 0.6,
    };

    const nextResult = await CountNode.create(
      { onCount: captureNext, onStop: captureNext },
      utils,
    )(initialState);

    if (!nextResult) throw new Error("Expected Next, got null");
    await nextResult.run();

    assertEquals(capturedState?.count, 6);
  },
);

Deno.test(
  "countNode should increment count and transition to onStop if random <= 0.5",
  async () => {
    const initialState: CountNode.State = { count: 10 };
    let capturedState: CountNode.State | undefined;
    const captureCount: Nextable<CountNode.State> = (_s) => {
      return null;
    };
    const captureStop: Nextable<CountNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: CountNode.Utils = {
      print: () => {},
      sleep: async () => {},
      random: () => 0.4,
    };

    const nextResult = await CountNode.create(
      { onCount: captureCount, onStop: captureStop },
      utils,
    )(initialState);

    if (!nextResult) throw new Error("Expected Next, got null");
    await nextResult.run();

    assertEquals(capturedState?.count, 11);
  },
);
