import { factory, Utils } from "../startNode.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "startNode should transition to onSuccess with 0 if input is empty",
  async () => {
    const utils: Utils = {
      readLine: (_msg: string) => "",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(undefined);

    assertEquals(result[0], "next");
    assertEquals(result[1].count, 0);
  },
);

Deno.test(
  "startNode should transition to onSuccess with input number",
  async () => {
    const utils: Utils = {
      readLine: (_msg: string) => "42",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(undefined);

    assertEquals(result[0], "next");
    assertEquals(result[1].count, 42);
  },
);

Deno.test(
  "startNode should transition to onError if input is invalid",
  async () => {
    const utils: Utils = {
      readLine: (_msg: string) => "abc",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSuccess: "next", onError: "error" },
      utils,
    )(undefined);

    assertEquals(result[0], "error");
    assertEquals(result[1].count, 0);
  },
);
