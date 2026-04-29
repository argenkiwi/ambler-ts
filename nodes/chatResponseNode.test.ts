import { assertEquals } from "@std/assert";
import * as ChatResponseNode from "./chatResponseNode.ts";

Deno.test(
  "chatResponseNode should send messages to chat, print reply, and append to history",
  async () => {
    const initialState: ChatResponseNode.State = {
      ollamaHost: "http://localhost:11434",
      selectedModel: "llama3.2",
      messages: [{ role: "user", content: "Hello" }],
    };

    let printed: string | undefined;
    const utils: ChatResponseNode.Utils = {
      chat: (_host, _model, _messages) => Promise.resolve("Hi there!"),
      print: (msg) => {
        printed = msg;
      },
    };

    const result = await ChatResponseNode.create(
      { onPrompt: "onPrompt" },
      utils,
    )(initialState);

    assertEquals(printed, "Assistant: Hi there!");
    assertEquals(result.state.messages, [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ]);

    assertEquals(result.next, "onPrompt");
  },
);

Deno.test(
  "chatResponseNode should pass the full message history to the chat util",
  async () => {
    const initialState: ChatResponseNode.State = {
      ollamaHost: "http://localhost:11434",
      selectedModel: "llama3.2",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi!" },
        { role: "user", content: "How are you?" },
      ],
    };

    let receivedMessages: ChatResponseNode.Message[] | undefined;
    let receivedHost: string | undefined;
    let receivedModel: string | undefined;
    const utils: ChatResponseNode.Utils = {
      chat: (host, model, messages) => {
        receivedHost = host;
        receivedModel = model;
        receivedMessages = messages;
        return Promise.resolve("I'm fine!");
      },
      print: () => {},
    };

    const result = await ChatResponseNode.create(
      { onPrompt: "onPrompt" },
      utils,
    )(initialState);

    assertEquals(receivedMessages?.length, 3);
    assertEquals(receivedMessages?.[2], {
      role: "user",
      content: "How are you?",
    });

    assertEquals(receivedHost, "http://localhost:11434");
    assertEquals(receivedModel, "llama3.2");
    assertEquals(result.next, "onPrompt");
  },
);
