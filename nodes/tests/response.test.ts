import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../response.ts";

Deno.test("responseNode should transition to onComplete and append assistant response", async () => {
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
     { onComplete: "prompt" },
    utils,
   )(initialState);

  assertEquals(result[0], "prompt");
  assertEquals(result[1].messages.length, 2);
  assertEquals(result[1].messages[1], { role: "assistant", content: "hi there" });
});
