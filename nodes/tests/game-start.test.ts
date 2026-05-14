import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../game-start.ts";

Deno.test("game-startNode should initialize game state on success", async () => {
  const initialState: State = {
    messages: [],
    questionCount: -1,
    guessCount: -1,
  };

  const utils: Utils = {
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].questionCount, 0);
  assertEquals(result[1].guessCount, 0);
  assertEquals(result[1].messages.length, 1);
  assertEquals(result[1].messages[0].role, "system");
});
