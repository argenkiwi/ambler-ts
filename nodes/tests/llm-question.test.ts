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

Deno.test("llm-questionNode should reject questions and re-prompt if questionCount is 20", async () => {
  const initialState: State = {
    messages: [{ role: "system", content: "test" }],
    host: "localhost",
    model: "test-model",
    questionCount: 20,
    guessCount: 0,
  };

  let callCount = 0;
  const utils: Utils = {
    chat: (_messages, _model, _host) => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve("Is it red?"); // Invalid question
      }
      return Promise.resolve("Is the answer a red ball?"); // Valid guess
    },
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "next" },
    utils,
  )(initialState);

  assertEquals(callCount, 2);
  assertEquals(result[0], "next");
  assertEquals(result[1].questionCount, 20);
  assertEquals(result[1].guessCount, 1);
  // messages: [initial] + [invalid question] + [correction system msg] + [valid guess]
  assertEquals(result[1].messages.length, 4);
  assertEquals(result[1].messages[1].content, "Is it red?");
  assertEquals(result[1].messages[2].role, "system");
  assertEquals(result[1].messages[3].content, "Is the answer a red ball?");
});
