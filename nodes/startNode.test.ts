import * as StartNode from "./startNode.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "startNode should transition to onSuccess with 0 if input is empty",
  () => {
    const initialState: StartNode.State = { count: 0 };

    const utils: StartNode.Utils = {
      readLine: () => "",
      print: () => {},
    };

    const result = StartNode.create(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].count, 0);
  },
);

Deno.test(
  "startNode should transition to onSuccess with input number",
  () => {
    const initialState: StartNode.State = { count: 0 };

    const utils: StartNode.Utils = {
      readLine: () => "42",
      print: () => {},
    };

    const result = StartNode.create(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].count, 42);
  },
);

Deno.test(
  "startNode should transition to onError if input is invalid",
  () => {
    const initialState: StartNode.State = { count: 123 };

    const utils: StartNode.Utils = {
      readLine: () => "abc",
      print: () => {},
    };

    const result = StartNode.create(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result[0], "error");
    assertEquals(result[1].count, 123);
  },
);
