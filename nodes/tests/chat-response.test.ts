import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../chat-response.ts";

Deno.test("chat-responseNode should transition to onComplete and append assistant response", async () => {
  const initialState: State = {
    messages: [{ role: "user", content: "hello" }],
    host: "http://localhost:11434",
    model: "llama3",
  };
  const utils: Utils = {
    chat: async (_messages, _model, _host) => "hi there",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onComplete: "next" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].messages.length, 2);
  assertEquals(result[1].messages[1], { role: "assistant", content: "hi there" });
});
