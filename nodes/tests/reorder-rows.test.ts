import { factory, State, Utils } from "../reorder-rows.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "reorderRowsNode with empty data",
  async () => {
    const state: State = { data: [] };
    const utils: Utils = {
      readLine: () => "yes",
      print: () => {},
    };
    const result = factory({ onComplete: "NEXT", onError: "ERROR" }, utils)(
      state,
    );
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].data, []);
  },
);

Deno.test(
  "reorderRowsNode with one row",
  async () => {
    const state: State = { data: [["Alice", "30"]] };
    const utils: Utils = {
      readLine: () => "yes",
      print: () => {},
    };
    const result = factory({ onComplete: "NEXT", onError: "ERROR" }, utils)(
      state,
    );
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].data, [["Alice", "30"]]);
  },
);

Deno.test(
  "reorderRowsNode reorders correctly with binary insert",
  async () => {
    // Data: [A, B, C]. Sorted starts with [A].
    // Insert B: "B before A?" -> no -> B after A. Sorted: [A, B].
    // Insert C: "C before A?" -> no (lo=1), "C before B?" -> no (lo=2).
    // Final: [A, B, C].
    const state: State = {
      data: [["Alice", "30"], ["Bob", "25"], ["Charlie", "35"]],
    };
    const answers: string[] = ["no", "no", "no"];
    const utils: Utils = {
      readLine: () => answers.shift()!,
      print: () => {},
    };
    const result = factory(
      { onComplete: "NEXT", onError: "ERROR" },
      utils,
    )(state);
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].data.length, 3);
  },
);
