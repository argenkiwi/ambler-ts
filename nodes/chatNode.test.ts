import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ChatNode } from "./chatNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: ChatNode.State = { model: "llama3" };

Deno.test("chatNode: terminates on /quit", async () => {
  const result = await ChatNode.create(
    { onContinue: async () => null },
    { chat: async () => "", readLine: async () => "/quit", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("chatNode: terminates on /exit", async () => {
  const result = await ChatNode.create(
    { onContinue: async () => null },
    { chat: async () => "", readLine: async () => "/exit", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("chatNode: terminates on /bye", async () => {
  const result = await ChatNode.create(
    { onContinue: async () => null },
    { chat: async () => "", readLine: async () => "/bye", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("chatNode: sends prompt to model and loops on non-exit input", async () => {
  let sentPrompt: string | undefined;
  let printedResponse: string | undefined;
  let wentToContinue = false;

  const captureNext: Nextable<ChatNode.State> = async () => {
    wentToContinue = true;
    return null;
  };

  const next = await ChatNode.create(
    { onContinue: captureNext },
    {
      chat: async (_model, p) => { sentPrompt = p; return "Hello from model!"; },
      readLine: async () => "Hello",
      print: (msg) => { printedResponse = msg; },
    },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(sentPrompt, "Hello");
  assertEquals(printedResponse, "Hello from model!");
  assertEquals(wentToContinue, true);
});

Deno.test("chatNode: loops without calling model on empty input", async () => {
  let modelCalled = false;
  let wentToContinue = false;

  const captureNext: Nextable<ChatNode.State> = async () => {
    wentToContinue = true;
    return null;
  };

  const next = await ChatNode.create(
    { onContinue: captureNext },
    {
      chat: async () => { modelCalled = true; return ""; },
      readLine: async () => "  ",
      print: () => {},
    },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(modelCalled, false);
  assertEquals(wentToContinue, true);
});
