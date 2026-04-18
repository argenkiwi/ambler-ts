import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as StoryPageNode from "./storyPageNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: StoryPageNode.State = {
  selectedModel: "llama3",
  ollamaHost: "http://localhost:11434",
  identity: "Ada",
  placement: "London, 1842",
  circumstances: "Inventing the engine",
  storyPages: [],
  currentPage: 1,
};

Deno.test("storyPageNode should transition onPageComplete when reply ends with 'The End'", async () => {
  let capturedState: StoryPageNode.State | undefined;
  const captureNext: Nextable<StoryPageNode.State> = async (s) => {
    capturedState = s;
    return null;
  };

  const utils: StoryPageNode.Utils = {
    chat: async (_host, _model, _messages) => "You discovered the secret. The End",
    readLine: async (_msg) => null,
    print: () => {},
  };

  const result = await StoryPageNode.create(
    { onPageComplete: captureNext, onDecisionRequired: async (_s) => null },
    utils,
  )(baseState);

  if (!result) throw new Error("Expected Next, got null");
  await result.run();

  assertEquals(capturedState?.storyPages.length, 1);
  assertEquals(capturedState?.currentPage, 2);
  assertEquals(capturedState?.storyPages[0], "You discovered the secret. The End");
});

Deno.test("storyPageNode should transition onDecisionRequired when reply has options", async () => {
  let capturedState: StoryPageNode.State | undefined;
  const captureNext: Nextable<StoryPageNode.State> = async (s) => {
    capturedState = s;
    return null;
  };

  const reply = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
  const utils: StoryPageNode.Utils = {
    chat: async (_host, _model, _messages) => reply,
    readLine: async (_msg) => null,
    print: () => {},
  };

  const result = await StoryPageNode.create(
    { onPageComplete: async (_s) => null, onDecisionRequired: captureNext },
    utils,
  )(baseState);

  if (!result) throw new Error("Expected Next, got null");
  await result.run();

  assertEquals(capturedState?.storyPages.length, 1);
  assertEquals(capturedState?.currentPage, 2);
});
