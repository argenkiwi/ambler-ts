import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../chatPromptNode.ts";

Deno.test(
  "chatPromptNode should transition to onChat with user message appended",
  async () => {
    const initialState: State = { messages: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "Hello",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onChat");
    assertEquals(result[1].messages, [{ role: "user", content: "Hello" }]);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'bye'",
  async () => {
    const initialState: State = { messages: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "bye",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'exit'",
  async () => {
    const initialState: State = { messages: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "exit",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'quit'",
  async () => {
    const initialState: State = { messages: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "quit",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when input is null",
  async () => {
    const initialState: State = { messages: [] };

    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should preserve existing messages when appending user input",
  async () => {
    const initialState: State = {
      messages: [
        { role: "user", content: "First message" },
        { role: "assistant", content: "First reply" },
      ],
    };

    const utils: Utils = {
      readLine: (_msg: string) => "Second message",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[1].messages.length, 3);
    assertEquals(result[1].messages[2], {
      role: "user",
      content: "Second message",
    });
  },
);
