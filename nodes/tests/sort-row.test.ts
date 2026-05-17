import { factory, State, Utils } from "../sort-row.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  data: [["Alice", "30"], ["Bob", "25"]],
  new_row: ["Charlie", "35"],
};

Deno.test(
  "sortRowNode should insert at beginning when user says 'yes' (before first)",
  async () => {
    // "Charlie" before "Alice,30"? yes -> hi = 0
    const utils: Utils = {
      readLine: () => "yes",
      print: () => {},
    };
    const result = factory(
      { onComplete: "DONE", onError: "ERROR" },
      utils,
    )(baseState);
    assertEquals(result[0], "DONE");
    assertEquals(result[1].data.length, 3);
    assertEquals(result[1].data[0], ["Charlie", "35"]);
    assertEquals(result[1].data[1], ["Alice", "30"]);
    assertEquals(result[1].data[2], ["Bob", "25"]);
  },
);

Deno.test(
  "sortRowNode should insert at end when user says 'no' to all comparisons",
  async () => {
    // "Charlie" before "Alice,30"? no -> lo = 1
    // "Charlie" before "Bob,25"? no -> lo = 2
    const utils: Utils = {
      readLine: () => "no",
      print: () => {},
    };
    const result = factory(
      { onComplete: "DONE", onError: "ERROR" },
      utils,
    )(baseState);
    assertEquals(result[0], "DONE");
    assertEquals(result[1].data.length, 3);
    assertEquals(result[1].data[2], ["Charlie", "35"]);
  },
);

Deno.test(
  "sortRowNode should insert in the middle (yes, no means idx=1)",
  async () => {
    // Single row ["Bob","25"], "Charlie" before "Bob"? yes -> insert at 0
    const state: State = {
      data: [["Bob", "25"]],
      new_row: ["Charlie", "35"],
    };
    const utils: Utils = {
      readLine: () => "yes",
      print: () => {},
    };
    const result = factory(
      { onComplete: "DONE", onError: "ERROR" },
      utils,
    )(state);
    assertEquals(result[0], "DONE");
    assertEquals(result[1].data[0], ["Charlie", "35"]);
    assertEquals(result[1].data[1], ["Bob", "25"]);
  },
);

Deno.test(
  "sortRowNode should append when no existing rows",
  async () => {
    const state: State = {
      data: [],
      new_row: ["Charlie", "35"],
    };
    const utils: Utils = {
      readLine: () => "yes",
      print: () => {},
    };
    const result = factory(
      { onComplete: "DONE", onError: "ERROR" },
      utils,
    )(state);
    assertEquals(result[0], "DONE");
    assertEquals(result[1].data, [["Charlie", "35"]]);
  },
);
