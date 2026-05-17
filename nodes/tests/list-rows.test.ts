import { factory, State, Utils } from "../list-rows.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  data: [["Alice", "30"], ["Bob", "25"]],
};

Deno.test(
    "listRowsNode should print all rows and transition to onComplete",
  async () => {
    const printed: string[] = [];
    const utils: Utils = {
      print: (msg) => printed.push(msg),
    };
    const result = factory({ onComplete: "NEXT" }, utils)(baseState);
    assertEquals(result[0], "NEXT");
    assertEquals(printed.length, 2);
    assertEquals(printed[0], "  1. Alice, 30");
    assertEquals(printed[1], "  2. Bob, 25");
  },
);

Deno.test(
    "listRowsNode should indicate no rows when data is empty",
  async () => {
    const printed: string[] = [];
    const utils: Utils = {
      print: (msg) => printed.push(msg),
    };
    const result = factory({ onComplete: "NEXT" }, utils)({
      data: [],
    });
    assertEquals(result[0], "NEXT");
    assertEquals(printed[0], "No rows in the file.");
  },
);