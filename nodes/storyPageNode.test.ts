import * as StoryPageNode from "./storyPageNode.ts";
import { Node, stop } from "../ambler.ts";
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
    let capturedState: StoryPageNode.State | undefined;
    const captureNext: Node<StoryPageNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: StoryPageNode.Utils = {
      chat: (_host, _model, _messages) =>
        Promise.resolve("You discovered the secret. The End"),
      print: () => {},
    };

    const result = await StoryPageNode.create(
      {
        onPageComplete: captureNext,
        onDecisionRequired: (_s) => stop(),
        onError: () => stop(),
      },
      utils,
    )(baseState);

    await result();

    assertEquals(capturedState?.storyPages.length, 1);
    assertEquals(capturedState?.currentPage, 2);
    assertEquals(
      capturedState?.storyPages[0],
      "You discovered the secret. The End",
    );
  },
);

Deno.test(
  "storyPageNode should transition onDecisionRequired when reply has options",
  async () => {
    let capturedState: StoryPageNode.State | undefined;
    const captureNext: Node<StoryPageNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const reply = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const utils: StoryPageNode.Utils = {
      chat: (_host, _model, _messages) => Promise.resolve(reply),
      print: () => {},
    };

    const result = await StoryPageNode.create(
      {
        onPageComplete: (_s) => stop(),
        onDecisionRequired: captureNext,
        onError: () => stop(),
      },
      utils,
    )(baseState);

    await result();

    assertEquals(capturedState?.storyPages.length, 1);
    assertEquals(capturedState?.currentPage, 2);
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
        onPageComplete: (_s) => stop(),
        onDecisionRequired: (_s) => stop(),
        onError: () => stop(),
      },
      utils,
    )(baseState);

    let next = await result();
    while (typeof next === "function") {
      next = await next();
    }
    assertEquals(next, null);
  },
);
