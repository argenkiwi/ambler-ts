import { assertEquals } from "@std/assert";
import { factory, Message, State, Utils } from "../chatResponseNode.ts";

Deno.test(
  "chatResponseNode should send messages to chat, print reply, and append to history",
  async () => {
    const initialState: State = {
      ollamaHost: "http://localhost:11434",
      selectedModel: "llama3.2",
      messages: [{ role: "user", content: "Hello" }],
    };

    let printed: string | undefined;
    const utils: Utils = {
      chat: (_host: string, _model: string, _messages: Message[]) =>
        Promise.resolve("Hi there!"),
      print: (msg: string) => {
        printed = msg;
      },
    };

    const result = await factory(
      { onPrompt: "onPrompt" },
      utils,
    )(initialState);

    assertEquals(printed, "Assistant: Hi there!");
    assertEquals(result[1].messages, [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ]);

    assertEquals(result[0], "onPrompt");
  },
);

Deno.test(
  "chatResponseNode should pass the full message history to the chat util",
  async () => {
    const initialState: State = {
      ollamaHost: "http://localhost:11434",
      selectedModel: "llama3.2",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi!" },
        { role: "user", content: "How are you?" },
      ],
    };

    let receivedMessages: Message[] | undefined;
    let receivedHost: string | undefined;
    let receivedModel: string | undefined;
    const utils: Utils = {
      chat: (host: string, model: string, messages: Message[]) => {
        receivedHost = host;
        receivedModel = model;
        receivedMessages = messages;
        return Promise.resolve("I'm fine!");
      },
      print: (_msg: string) => {},
    };

    const result = await factory(
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
    assertEquals(result[0], "onPrompt");
  },
);
