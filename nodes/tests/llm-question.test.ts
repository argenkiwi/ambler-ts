import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../llm-question.ts";
import { Message } from "../game-start.ts";

Deno.test("llm-questionNode should call chat and increment questionCount on success", async () => {
  const initialState: State = {
    messages: [{ role: "system", content: "test" }],
    host: "localhost",
    model: "test-model",
    questionCount: 0,
    guessCount: 0,
  };

  const utils: Utils = {
    chat: (_messages, _model, _host) => Promise.resolve("Is it a cat?"),
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].questionCount, 1);
  assertEquals(result[1].guessCount, 0);
  assertEquals(result[1].messages.length, 2);
});

Deno.test("llm-questionNode should increment guessCount and NOT questionCount for guesses", async () => {
  const initialState: State = {
    messages: [{ role: "system", content: "test" }],
    host: "localhost",
    model: "test-model",
    questionCount: 5,
    guessCount: 1,
  };

  const utils: Utils = {
    chat: (_messages, _model, _host) => Promise.resolve("Is the answer a dog?"),
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].questionCount, 5);
  assertEquals(result[1].guessCount, 2);
});

Deno.test("llm-questionNode should add a hint when questionCount is 15 or more", async () => {
  const initialState: State = {
    messages: [{ role: "system", content: "test" }],
    host: "localhost",
    model: "test-model",
    questionCount: 15,
    guessCount: 0,
  };

  let capturedMessages: Message[] = [];
  const utils: Utils = {
    chat: (messages, _model, _host) => {
      capturedMessages = messages;
      return Promise.resolve("Is the answer a toaster?");
    },
    print: (_msg: string) => {},
  };

  await factory(
    { onSuccess: "next" },
    utils,
  )(initialState);

  // Initial (1) + Hint (1) = 2 messages sent to chat
  assertEquals(capturedMessages.length, 2);
  assertEquals(capturedMessages[1].role, "system");
  assertEquals(capturedMessages[1].content.includes("15/20 questions"), true);
});
