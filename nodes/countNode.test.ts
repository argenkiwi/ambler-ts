import { assertEquals } from "@std/assert";
import * as CountNode from "./countNode.ts";

Deno.test(
  "countNode should increment count and transition to onCount if random > 0.5",
  async () => {
    const initialState: CountNode.State = { count: 5 };

    const utils: CountNode.Utils = {
      print: () => {},
      sleep: async () => {},
      random: () => 0.6,
    };

    const result = await CountNode.create(
      { onCount: "onCount", onStop: "onStop" },
      utils,
    )(initialState);

    assertEquals(result.next, "onCount");
    assertEquals(result.state.count, 6);
  },
);

Deno.test(
  "countNode should increment count and transition to onStop if random <= 0.5",
  async () => {
    const initialState: CountNode.State = { count: 10 };

    const utils: CountNode.Utils = {
      print: () => {},
      sleep: async () => {},
      random: () => 0.4,
    };

    const result = await CountNode.create(
      { onCount: "onCount", onStop: "onStop" },
      utils,
    )(initialState);

    assertEquals(result.next, "onStop");
    assertEquals(result.state.count, 11);
  },
);
