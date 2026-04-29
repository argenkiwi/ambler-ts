import * as StoryPageNode from "./storyPageNode.ts";
import { assertEquals } from "@std/assert";

const baseState: StoryPageNode.State = {
  selectedModel: "llama3",
  ollamaHost: "http://localhost:11434",
  identity: "Ada",
  placement: "London, 1842",
  circumstances: "Inventing the engine",
  storyPages: [],
  currentPage: 1,
};

Deno.test(
  "storyPageNode should transition onPageComplete when reply ends with 'The End'",
  async () => {
    const utils: StoryPageNode.Utils = {
      chat: (_host, _model, _messages) =>
        Promise.resolve("You discovered the secret. The End"),
      print: () => {},
    };

    const result = await StoryPageNode.create(
      {
        onPageComplete: "complete",
        onDecisionRequired: "decision",
        onError: "error",
      },
      utils,
    )(baseState);

    assertEquals(result.next, "complete");
    assertEquals(result.state.storyPages.length, 1);
    assertEquals(result.state.currentPage, 2);
    assertEquals(
      result.state.storyPages[0],
      "You discovered the secret. The End",
    );
  },
);

Deno.test(
  "storyPageNode should transition onDecisionRequired when reply has options",
  async () => {
    const reply = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const utils: StoryPageNode.Utils = {
      chat: (_host, _model, _messages) => Promise.resolve(reply),
      print: () => {},
    };

    const result = await StoryPageNode.create(
      {
        onPageComplete: "complete",
        onDecisionRequired: "decision",
        onError: "error",
      },
      utils,
    )(baseState);

    assertEquals(result.next, "decision");
    assertEquals(result.state.storyPages.length, 1);
    assertEquals(result.state.currentPage, 2);
  },
);

Deno.test(
  "storyPageNode should call onError when chat throws",
  async () => {
    const utils: StoryPageNode.Utils = {
      chat: (_host, _model, _messages) => {
        throw new Error("connection failed");
      },
      print: () => {},
    };

    const result = await StoryPageNode.create(
      {
        onPageComplete: "complete",
        onDecisionRequired: "decision",
        onError: "error",
      },
      utils,
    )(baseState);

    assertEquals(result.next, "error");
    assertEquals(result.state, baseState);
  },
);
