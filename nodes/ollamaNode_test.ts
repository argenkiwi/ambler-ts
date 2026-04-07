import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { OllamaNode } from "./ollamaNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("OllamaNode should send messages and append assistant response to state", async () => {
  const initialState: OllamaNode.State = {
    messages: [{ role: "user", content: "Hello!" }],
  };
  let capturedState: OllamaNode.State | undefined;
  const onResponse: Nextable<OllamaNode.State> = async (s) => {
    capturedState = s;
    return null;
  };

  const mockResponse = {
    ok: true,
    json: async () => ({
      message: { role: "assistant", content: "Hi there!" },
    }),
  };

  const utils: OllamaNode.Utils = {
    print: () => {},
    fetch: (async () => mockResponse as unknown as Response) as typeof fetch,
  };

  const nextResult = await OllamaNode.create({ onResponse }, utils)(initialState);
  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.messages.length, 2);
  assertEquals(capturedState?.messages[1].role, "assistant");
  assertEquals(capturedState?.messages[1].content, "Hi there!");
});

Deno.test("OllamaNode should handle API errors gracefully", async () => {
  const initialState: OllamaNode.State = {
    messages: [{ role: "user", content: "Hello!" }],
  };
  let capturedState: OllamaNode.State | undefined;
  const onResponse: Nextable<OllamaNode.State> = async (s) => {
    capturedState = s;
    return null;
  };

  const utils: OllamaNode.Utils = {
    print: () => {},
    fetch: (async () => {
      throw new Error("Connection failed");
    }) as unknown as typeof fetch,
  };

  const nextResult = await OllamaNode.create({ onResponse }, utils)(initialState);
  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  // State should be unchanged on error in current implementation
  assertEquals(capturedState?.messages.length, 1);
});
