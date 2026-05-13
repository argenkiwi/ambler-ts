import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../transpose.ts";

Deno.test("transposeNode should transpose the last user message consonants", async () => {
  const initialState: State = {
    messages: [{ role: "user", content: "hello" }],
   };
  const utils: Utils = {
    transpose: (text: string) => text.split("").map((ch) => {
      if (ch.toLowerCase() === "h") return ch.toLowerCase() === "h" ? "g" : "G";
      return ch;
     }).join(""),
    print: (_msg: string) => {},
   };

  const result = await factory({ onComplete: "response" }, utils)(initialState);

  assertEquals(result[0], "response");
  assertEquals(result[1].messages.length, 1);
});

Deno.test("transposeNode should leave state unchanged when no messages", async () => {
  const initialState: State = { messages: [] };
  const utils: Utils = {
    transpose: (_text: string) => "no-op",
    print: (_msg: string) => {},
   };

  const result = await factory({ onComplete: "response" }, utils)(initialState);

  assertEquals(result[0], "response");
  assertEquals(result[1].messages.length, 0);
});

Deno.test("transposeNode should leave state unchanged when last message is not user", async () => {
  const initialState: State = {
    messages: [{ role: "assistant", content: "hi" }],
   };
  const utils: Utils = {
    transpose: (_text: string) => "no-op",
    print: (_msg: string) => {},
   };

  const result = await factory({ onComplete: "response" }, utils)(initialState);

  assertEquals(result[0], "response");
  assertEquals(result[1].messages[0].content, "hi");
});
