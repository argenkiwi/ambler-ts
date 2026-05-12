import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../kpsStop.ts";

Deno.test("kpsStopNode should transition to onDone", async () => {
  const initialState: State = {};
  const utils: Utils = { print: () => {} };

  const result = await factory({ onDone: "exit" }, utils)(initialState);

  assertEquals(result[0], "exit");
});
