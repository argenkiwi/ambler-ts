import { factory, State, Utils } from "../end.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "endNode should always transition to onDone",
  async () => {
    const state: State = {};
    const utils: Utils = { print: () => {} };
    const result = factory({ onDone: "DONE" }, utils)(state);
    assertEquals(result[0], "DONE");
  },
);
