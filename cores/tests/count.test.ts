import { assertEquals } from "@std/assert";
import { factory, Utils } from "../count.ts";

Deno.test(
  "countNode should increment count and transition to onCount if random > 0.5",
  async () => {
    const initialCount = 5;

    const utils: Utils = {
      print: (_msg: string) => {},
      sleep: async (_ms: number) => {},
      random: () => 0.6,
    };

    const result = await factory(
      { onCount: "onCount", onStop: "onStop" },
      utils,
    )(initialCount);

    assertEquals(result[0], "onCount");
    assertEquals(result[1], 6);
  },
);

Deno.test(
  "countNode should increment count and transition to onStop if random <= 0.5",
  async () => {
    const initialCount = 10;

    const utils: Utils = {
      print: (_msg: string) => {},
      sleep: async (_ms: number) => {},
      random: () => 0.4,
    };

    const result = await factory(
      { onCount: "onCount", onStop: "onStop" },
      utils,
    )(initialCount);

    assertEquals(result[0], "onStop");
    assertEquals(result[1], 11);
  },
);
