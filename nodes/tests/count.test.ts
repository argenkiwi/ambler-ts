import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../count.ts";

Deno.test(
  "countNode should increment count and transition to onCount if random > 0.5",
  async () => {
    const initialState: State = { count: 5 };

    const utils: Utils = {
      print: (_msg: string) => {},
      sleep: async (_ms: number) => {},
      random: () => 0.6,
    };

    const result = await factory(
      { onCount: "onCount", onStop: "onStop" },
      utils,
    )(initialState);

    assertEquals(result[0], "onCount");
    assertEquals(result[1].count, 6);
  },
);

Deno.test(
  "countNode should increment count and transition to onStop if random <= 0.5",
  async () => {
    const initialState: State = { count: 10 };

    const utils: Utils = {
      print: (_msg: string) => {},
      sleep: async (_ms: number) => {},
      random: () => 0.4,
    };

    const result = await factory(
      { onCount: "onCount", onStop: "onStop" },
      utils,
    )(initialState);

    assertEquals(result[0], "onStop");
    assertEquals(result[1].count, 11);
  },
);
