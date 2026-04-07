import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PromptNode } from "./promptNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("PromptNode should append user message to state", async () => {
  const initialState: PromptNode.State = { messages: [] };
  let capturedState: PromptNode.State | undefined;
  const onInput: Nextable<PromptNode.State> = async (s) => { capturedState = s; return null; };
  const onExit: Nextable<PromptNode.State> = async (_s) => { return null; };

  const utils: PromptNode.Utils = {
    readLine: async () => "Hello, world!",
  };

  const nextResult = await PromptNode.create({ onInput, onExit }, utils)(initialState);
  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.messages.length, 1);
  assertEquals(capturedState?.messages[0].role, "user");
  assertEquals(capturedState?.messages[0].content, "Hello, world!");
});

Deno.test("PromptNode should transition to onExit for 'exit'", async () => {
  const initialState: PromptNode.State = { messages: [] };
  let exited = false;
  const onInput: Nextable<PromptNode.State> = async (_s) => { return null; };
  const onExit: Nextable<PromptNode.State> = async (_s) => { exited = true; return null; };

  const utils: PromptNode.Utils = {
    readLine: async () => "exit",
  };

  const nextResult = await PromptNode.create({ onInput, onExit }, utils)(initialState);
  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(exited, true);
});

Deno.test("PromptNode should transition to onExit for 'bye'", async () => {
  const initialState: PromptNode.State = { messages: [] };
  let exited = false;
  const onInput: Nextable<PromptNode.State> = async (_s) => { return null; };
  const onExit: Nextable<PromptNode.State> = async (_s) => { exited = true; return null; };

  const utils: PromptNode.Utils = {
    readLine: async () => "bye",
  };

  const nextResult = await PromptNode.create({ onInput, onExit }, utils)(initialState);
  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(exited, true);
});
