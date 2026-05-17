import { factory, State, Utils } from "../get-new-row.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  data: [["Alice", "30"]],
};

Deno.test(
  "getNewRowNode should parse comma-separated input and transition to onSuccess",
  async () => {
    const utils: Utils = {
      readLine: (_msg) => "Charlie, 35",
      print: () => {},
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      baseState,
    );
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].new_row, ["Charlie", "35"]);
  },
);

Deno.test(
  "getNewRowNode should transition to onError when input is empty",
  async () => {
    const utils: Utils = {
      readLine: (_msg) => "",
      print: () => {},
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      baseState,
    );
    assertEquals(result[0], "ERROR");
    assertEquals(result[1].new_row, undefined);
  },
);
