import { assertEquals } from "@std/assert";
import { factory, Message, Utils } from "../chatPrompt.ts";

Deno.test(
  "chatPromptNode should transition to onChat with user message appended",
  () => {
    const input: Message[] = [];

    const utils: Utils = {
      readLine: (_msg: string) => "Hello",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(input);

    assertEquals(result[0], "onChat");
    assertEquals(result[1], [{ role: "user", content: "Hello" }]);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'bye'",
  () => {
    const input: Message[] = [];

    const utils: Utils = {
      readLine: (_msg: string) => "bye",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(input);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'exit'",
  () => {
    const input: Message[] = [];

    const utils: Utils = {
      readLine: (_msg: string) => "exit",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(input);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'quit'",
  () => {
    const input: Message[] = [];

    const utils: Utils = {
      readLine: (_msg: string) => "quit",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(input);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when input is null",
  () => {
    const input: Message[] = [];

    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(input);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should preserve existing messages when appending user input",
  () => {
    const input: Message[] = [
      { role: "user", content: "First message" },
      { role: "assistant", content: "First reply" },
    ];

    const utils: Utils = {
      readLine: (_msg: string) => "Second message",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(input);

    assertEquals(result[1].length, 3);
    assertEquals(result[1][2], {
      role: "user",
      content: "Second message",
    });
  },
);
