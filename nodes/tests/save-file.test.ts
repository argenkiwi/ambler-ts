import { factory, State, Utils } from "../save-file.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  csv_path: "/tmp/test.csv",
  has_header: true,
  header: ["name", "age"],
  data: [["Alice", "30"], ["Bob", "25"]],
};

Deno.test(
  "saveFileNode should write header and data rows",
  async () => {
    let written = false;
    let fileContent = "";
    const utils: Utils = {
      print: () => {},
      writeTextFile: (_path, content) => {
        written = true;
        fileContent = content;
      },
    };
    const result = factory(
      { onComplete: "NEXT", onError: "ERROR" },
      utils,
    )(baseState);
    assertEquals(result[0], "NEXT");
    assertEquals(written, true);
    assertEquals(
      fileContent,
      "name,age\nAlice,30\nBob,25\n",
    );
  },
);

Deno.test(
  "saveFileNode should skip header when has_header is false",
  async () => {
    let fileContent = "";
    const utils: Utils = {
      print: () => {},
      writeTextFile: (_path, content) => {
        fileContent = content;
      },
    };
    const state: State = {
      ...baseState,
      has_header: false,
      header: [],
    };
    const result = factory(
      { onComplete: "NEXT", onError: "ERROR" },
      utils,
    )(state);
    assertEquals(result[0], "NEXT");
    assertEquals(fileContent, "Alice,30\nBob,25\n");
  },
);

Deno.test(
  "saveFileNode should transition to onError when write fails",
  async () => {
    const utils: Utils = {
      print: () => {},
      writeTextFile: () => {
        throw new Error("write failed");
      },
    };
    const result = factory(
      { onComplete: "NEXT", onError: "ERROR" },
      utils,
    )(baseState);
    assertEquals(result[0], "ERROR");
  },
);
