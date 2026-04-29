import * as StartNode from "./startNode.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "startNode should transition to onSuccess with 0 if input is empty",
  async () => {
    const initialState: StartNode.State = { count: 0 };

    const utils: StartNode.Utils = {
      readLine: () => "",
      print: () => {},
    };

    const result = await StartNode.create(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result.next, "next");
    assertEquals(result.state.count, 0);
  },
);

Deno.test(
  "startNode should transition to onSuccess with input number",
  async () => {
    const initialState: StartNode.State = { count: 0 };

    const utils: StartNode.Utils = {
      readLine: () => "42",
      print: () => {},
    };

    const result = await StartNode.create(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result.next, "next");
    assertEquals(result.state.count, 42);
  },
);

Deno.test(
  "startNode should transition to onError if input is invalid",
  async () => {
    const initialState: StartNode.State = { count: 123 };

    const utils: StartNode.Utils = {
      readLine: () => "abc",
      print: () => {},
    };

    const result = await StartNode.create(
      { onSuccess: "next", onError: "error" },
      utils,
    )(initialState);

    assertEquals(result.next, "error");
    assertEquals(result.state.count, 123);
  },
);
