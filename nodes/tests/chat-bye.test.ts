import { assertEquals } from "@std/assert";
import { factory, Utils } from "../chat-bye.ts";

Deno.test("chat-byeNode should transition to onDone", async () => {
  const initialState = {};
  const utils: Utils = {
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onDone: "end" },
    utils,
  )(initialState);

  assertEquals(result[0], "end");
});
