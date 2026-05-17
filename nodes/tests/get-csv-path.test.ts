import { factory, State, Utils } from "../get-csv-path.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "getCsvPathNode should transition to onSuccess with a valid path",
  async () => {
    const initialState: State = { csv_path: "" };
    const utils: Utils = {
      readLine: (_msg) => "/path/to/data.csv",
      print: () => {},
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      initialState,
    );
    assertEquals(result[0], "NEXT");
    assertEquals(result[1].csv_path, "/path/to/data.csv");
  },
);

Deno.test(
  "getCsvPathNode should transition to onError when input is empty",
  async () => {
    const initialState: State = { csv_path: "" };
    const utils: Utils = {
      readLine: (_msg) => "",
      print: () => {},
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      initialState,
    );
    assertEquals(result[0], "ERROR");
    assertEquals(result[1].csv_path, "");
  },
);

Deno.test(
  "getCsvPathNode should transition to onError when input is null",
  async () => {
    const initialState: State = { csv_path: "" };
    const utils: Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };
    const result = factory({ onSuccess: "NEXT", onError: "ERROR" }, utils)(
      initialState,
    );
    assertEquals(result[0], "ERROR");
    assertEquals(result[1].csv_path, "");
  },
);
