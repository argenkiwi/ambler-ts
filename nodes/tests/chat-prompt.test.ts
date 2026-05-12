import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../chat-prompt.ts";

Deno.test("chat-promptNode should transition to onMessage when user enters a message", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    prompt: (_msg: string) => "hello",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onMessage: "next", onQuit: "bye" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].messages.length, 1);
  assertEquals(result[1].messages[0], { role: "user", content: "hello" });
});

Deno.test("chat-promptNode should transition to onQuit when user enters a quit word", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    prompt: (_msg: string) => "exit",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onMessage: "next", onQuit: "bye" },
    utils,
  )(initialState);

  assertEquals(result[0], "bye");
  assertEquals(result[1].messages.length, 0);
});

Deno.test("chat-promptNode should transition to onQuit when user cancels input", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    prompt: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onMessage: "next", onQuit: "bye" },
    utils,
  )(initialState);

  assertEquals(result[0], "bye");
  assertEquals(result[1].messages.length, 0);
});
