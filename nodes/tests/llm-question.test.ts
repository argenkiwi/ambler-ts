import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../llm-question.ts";

Deno.test("llm-questionNode should call chat and increment questionCount on success", async () => {
  const initialState: State = {
    messages: [{ role: "system", content: "test" }],
    host: "localhost",
    model: "test-model",
    questionCount: 0,
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
  assertEquals(result[1].messages.length, 2);
  assertEquals(result[1].messages[1].role, "assistant");
  assertEquals(result[1].messages[1].content, "Is it a cat?");
});
