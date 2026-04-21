import { assertEquals } from "@std/assert";
import * as ChatPromptNode from "./chatPromptNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test(
  "chatPromptNode should transition to onChat with user message appended",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let captured: ChatPromptNode.State | undefined;
    const capture: Nextable<ChatPromptNode.State> = (s) => {
      captured = s;
      return null;
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "Hello",
      print: () => {},
    };

    const next = await ChatPromptNode.create(
      { onChat: capture, onQuit: () => null },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(captured?.messages, [{ role: "user", content: "Hello" }]);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'bye'",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Nextable<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return null;
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "bye",
      print: () => {},
    };

    const next = await ChatPromptNode.create(
      { onChat: () => null, onQuit: captureQuit },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'exit'",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Nextable<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return null;
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "exit",
      print: () => {},
    };

    const next = await ChatPromptNode.create(
      { onChat: () => null, onQuit: captureQuit },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when user types 'quit'",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Nextable<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return null;
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "quit",
      print: () => {},
    };

    const next = await ChatPromptNode.create(
      { onChat: () => null, onQuit: captureQuit },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(quitCalled, true);
  },
);

Deno.test(
  "chatPromptNode should transition to onQuit when input is null",
  async () => {
    const initialState: ChatPromptNode.State = { messages: [] };
    let quitCalled = false;
    const captureQuit: Nextable<ChatPromptNode.State> = (_s) => {
      quitCalled = true;
      return null;
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => null,
      print: () => {},
    };

    const next = await ChatPromptNode.create(
      { onChat: () => null, onQuit: captureQuit },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

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
    const capture: Nextable<ChatPromptNode.State> = (s) => {
      captured = s;
      return null;
    };

    const utils: ChatPromptNode.Utils = {
      readLine: () => "Second message",
      print: () => {},
    };

    const next = await ChatPromptNode.create(
      { onChat: capture, onQuit: () => null },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(captured?.messages.length, 3);
    assertEquals(captured?.messages[2], {
      role: "user",
      content: "Second message",
    });
  },
);
