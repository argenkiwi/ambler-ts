import { assertEquals } from "@std/assert";
import * as ChatResponseNode from "./chatResponseNode.ts";
import { Node, stop } from "../ambler.ts";

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
    const capture: Node<ChatResponseNode.State> = (s) => {
      captured = s;
      return stop();
    };

    const utils: ChatResponseNode.Utils = {
      chat: (_messages, _host, _model) => Promise.resolve("Hi there!"),
      print: (msg) => {
        printed = msg;
      },
    };

    const result = await ChatResponseNode.create(
      { onPrompt: capture },
      utils,
    )(initialState);
    await result();

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
    const capture: Node<ChatResponseNode.State> = (_s) => stop();

    const utils: ChatResponseNode.Utils = {
      chat: (messages, host, model) => {
        receivedMessages = messages;
        receivedHost = host;
        receivedModel = model;
        return Promise.resolve("I'm fine!");
      },
      print: () => {},
    };

    const result = await ChatResponseNode.create(
      { onPrompt: capture },
      utils,
    )(initialState);
    await result();

    assertEquals(receivedMessages?.length, 3);
    assertEquals(receivedMessages?.[2], {
      role: "user",
      content: "How are you?",
    });
    assertEquals(receivedHost, "http://localhost:11434");
    assertEquals(receivedModel, "llama3.2");
  },
);
