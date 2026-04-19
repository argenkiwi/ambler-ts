import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as ChatResponseNode from "./chatResponseNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test(
  "chatResponseNode should send messages to chat, print reply, and append to history",
  async () => {
    const initialState: ChatResponseNode.State = {
      messages: [{ role: "user", content: "Hello" }],
      ollamaHost: "http://localhost:11434",
      selectedModel: "llama3.2",
    };
    let captured: ChatResponseNode.State | undefined;
    let printed: string | undefined;
    const capture: Nextable<ChatResponseNode.State> = async (s) => {
      captured = s;
      return null;
    };

    const utils: ChatResponseNode.Utils = {
      chat: async (_messages, _host, _model) => "Hi there!",
      print: (msg) => {
        printed = msg;
      },
    };

    const next = await ChatResponseNode.create(
      { onPrompt: capture },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(printed, "Assistant: Hi there!");
    assertEquals(captured?.messages, [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ]);
  },
);

Deno.test(
  "chatResponseNode should pass the full message history to the chat util",
  async () => {
    const initialState: ChatResponseNode.State = {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi!" },
        { role: "user", content: "How are you?" },
      ],
      ollamaHost: "http://localhost:11434",
      selectedModel: "llama3.2",
    };
    let receivedMessages: ChatResponseNode.Message[] | undefined;
    let receivedHost: string | undefined;
    let receivedModel: string | undefined;
    const capture: Nextable<ChatResponseNode.State> = async (_s) => null;

    const utils: ChatResponseNode.Utils = {
      chat: async (messages, host, model) => {
        receivedMessages = messages;
        receivedHost = host;
        receivedModel = model;
        return "I'm fine!";
      },
      print: () => {},
    };

    const next = await ChatResponseNode.create(
      { onPrompt: capture },
      utils,
    )(initialState);
    if (!next) throw new Error("Expected Next, got null");
    await next.run();

    assertEquals(receivedMessages?.length, 3);
    assertEquals(receivedMessages?.[2], {
      role: "user",
      content: "How are you?",
    });
    assertEquals(receivedHost, "http://localhost:11434");
    assertEquals(receivedModel, "llama3.2");
  },
);
