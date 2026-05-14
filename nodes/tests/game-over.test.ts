import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../game-over.ts";

Deno.test("game-overNode should finish on onDone", async () => {
  const initialState: State = {
    questionCount: 10,
    outcome: "win",
  };

  const utils: Utils = { print: (_msg: string) => {} };

  const result = await factory(
    { onDone: "finished" },
    utils,
  )(initialState);

  assertEquals(result[0], "finished");
});
