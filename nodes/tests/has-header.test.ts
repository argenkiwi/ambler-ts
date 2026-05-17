import { factory, State, Utils } from "../has-header.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  csv_path: "/tmp/test.csv",
  has_header: false,
  header: [],
  data: [],
};

Deno.test(
  "hasHeaderNode with yes should parse header and data rows",
  async () => {
    const utils: Utils = {
      readLine: (_msg) => "yes",
      print: () => {},
      readTextFile: (path) => "name,age\nAlice,30\nBob,25",
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      baseState,
    );
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].has_header, true);
    assertEquals(result[1].header, ["name", "age"]);
    assertEquals(result[1].data.length, 2);
    assertEquals(result[1].data[0], ["Alice", "30"]);
    assertEquals(result[1].data[1], ["Bob", "25"]);
  },
);

Deno.test(
  "hasHeaderNode with no should treat all rows as data",
  async () => {
    const utils: Utils = {
      readLine: (_msg) => "no",
      print: () => {},
      readTextFile: (path) => "Alice,30\nBob,25",
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      baseState,
    );
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].has_header, false);
    assertEquals(result[1].header, []);
    assertEquals(result[1].data.length, 2);
  },
);

Deno.test(
  "hasHeaderNode should go to onError with invalid input",
  async () => {
    const utils: Utils = {
      readLine: (_msg) => "maybe",
      print: () => {},
      readTextFile: (path) => "data",
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      baseState,
    );
    assertEquals(result[0], "ERROR");
  },
);

Deno.test(
  "hasHeaderNode should go to onError when file cannot be read",
  async () => {
    const utils: Utils = {
      readLine: (_msg) => "yes",
      print: () => {},
      readTextFile: (path) => null,
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      baseState,
    );
    assertEquals(result[0], "ERROR");
  },
);
