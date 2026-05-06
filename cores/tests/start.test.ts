import { factory, Utils } from "../start.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "startNode should transition to onSuccess with 0 if input is empty",
  () => {
    const utils: Utils = {
      readLine: (_msg: string) => "",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )();

    assertEquals(result[0], "next");
    assertEquals(result[1], 0);
  },
);

Deno.test(
  "startNode should transition to onSuccess with input number",
  () => {
    const utils: Utils = {
      readLine: (_msg: string) => "42",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )();

    assertEquals(result[0], "next");
    assertEquals(result[1], 42);
  },
);

Deno.test(
  "startNode should transition to onError if input is invalid",
  () => {
    const utils: Utils = {
      readLine: (_msg: string) => "abc",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )();

    assertEquals(result[0], "error");
    assertEquals(result[1], 0);
  },
);
