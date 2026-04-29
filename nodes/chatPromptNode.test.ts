import { assertEquals } from "@std/assert";
import * as ChatPromptNode from "./chatPromptNode.ts";

Deno.test(
  "chatPromptNode should transition to onChat with user message appended",
  () => {
    const initialState: ChatPromptNode.State = { messages: [] };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "Hello",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onChat");
    assertEquals(result[1].messages, [{ role: "user", content: "Hello" }]);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'bye'",
  () => {
    const initialState: ChatPromptNode.State = { messages: [] };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "bye",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'exit'",
  () => {
    const initialState: ChatPromptNode.State = { messages: [] };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "exit",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'quit'",
  () => {
    const initialState: ChatPromptNode.State = { messages: [] };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "quit",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when input is null",
  () => {
    const initialState: ChatPromptNode.State = { messages: [] };

    const utils: ChatPromptNode.Utils = {
      readLine: () => null,
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: "onChat", onQuit: "onQuit" },
      utils,
    )(initialState);

    assertEquals(result[0], "onQuit");
  },
);

Deno.test(
  "chatPromptNode should preserve existing messages when appending user input",
  () => {
    const initialState: ChatPromptNode.State = {
      messages: [
        { role: "user", content: "First message" },
        { role: "assistant", content: "First reply" },
      ],
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "Second message",
      print: () => {},
    };

    const result = ChatPromptNode.create(
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
