import { assertEquals } from "@std/assert";
import * as ChatPromptNode from "./chatPromptNode.ts";
import { Node, stop } from "../ambler.ts";

Deno.test(
  "chatPromptNode should transition to onChat with user message appended",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let captured: ChatPromptNode.State | undefined;
    const capture: Node<ChatPromptNode.State> = (s) => {
      captured = s;
      return stop();
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "Hello",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: capture, onQuit: () => stop() },
      utils,
    )(initialState);
    await (await result)();

    assertEquals(captured?.messages, [{ role: "user", content: "Hello" }]);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'bye'",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Node<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return stop();
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "bye",
      print: () => {},
    };

    const result = await ChatPromptNode.create(
      { onChat: () => stop(), onQuit: captureQuit },
      utils,
    )(initialState);
    await result();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'exit'",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Node<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return stop();
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "exit",
      print: () => {},
    };

    const result = await ChatPromptNode.create(
      { onChat: () => stop(), onQuit: captureQuit },
      utils,
    )(initialState);
    await result();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'quit'",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Node<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return stop();
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "quit",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: () => stop(), onQuit: captureQuit },
      utils,
    )(initialState);
    await (await result)();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when input is null",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Node<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return stop();
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => null,
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: () => stop(), onQuit: captureQuit },
      utils,
    )(initialState);
    await (await result)();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should preserve existing messages when appending user input",
  async () => {
    const initialState: ChatPromptNode.State = {
      messages: [
        { role: "user", content: "First message" },
        { role: "assistant", content: "First reply" },
      ],
    };
    let captured: ChatPromptNode.State | undefined;
    const capture: Node<ChatPromptNode.State> = (s) => {
      captured = s;
      return stop();
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "Second message",
      print: () => {},
    };

    const result = ChatPromptNode.create(
      { onChat: capture, onQuit: () => stop() },
      utils,
    )(initialState);
    await (await result)();

    assertEquals(captured?.messages.length, 3);
    assertEquals(captured?.messages[2], {
      role: "user",
      content: "Second message",
    });
  },
);
