import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../human-response.ts";

Deno.test("human-responseNode should add user message on success", async () => {
  const initialState: State = {
    messages: [],
  };

  const utils: Utils = {
    getPrompt: (_msg: string) => "yes",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next", onQuit: "quit" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].messages.length, 1);
  assertEquals(result[1].messages[0].role, "user");
  assertEquals(result[1].messages[0].content, "yes");
});

Deno.test("human-responseNode should set outcome to quit on onQuit", async () => {
  const initialState: State = {
    messages: [],
  };

  const utils: Utils = {
    getPrompt: (_msg: string) => "quit",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next", onQuit: "quit" },
    utils,
  )(initialState);

  assertEquals(result[0], "quit");
  assertEquals(result[1].outcome, "quit");
});
