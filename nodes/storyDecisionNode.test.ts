import * as StoryDecisionNode from "./storyDecisionNode.ts";
import { Node } from "../ambler.ts";
import { assertEquals } from "@std/assert/equals";

const baseState: StoryDecisionNode.State = {
  selectedModel: "llama3",
  ollamaHost: "http://localhost:11434",
  identity: "Ada",
  placement: "London",
  circumstances: "Crisis",
  storyPages: [],
  currentPage: 1,
};

Deno.test(
  "storyDecisionNode should return null when storyPages is empty",
  async () => {
    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await StoryDecisionNode.create(
      { onDecisionMade: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "storyDecisionNode should transition with unchanged state when no checkboxes found",
  async () => {
    let capturedState: StoryDecisionNode.State | undefined;
    const captureNext: Node<StoryDecisionNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const state = { ...baseState, storyPages: ["You reach the end. The End"] };
    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = StoryDecisionNode.create(
      { onDecisionMade: captureNext },
      utils,
    )(state);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    assertEquals(capturedState?.storyPages, state.storyPages);
  },
);

Deno.test(
  "storyDecisionNode should return null when readLine returns null",
  async () => {
    const state = {
      ...baseState,
      storyPages: [
        "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right",
      ],
    };

    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = StoryDecisionNode.create(
      { onDecisionMade: (_s) => null },
      utils,
    )(state);

    assertEquals(result, null);
  },
);

Deno.test(
  "storyDecisionNode should mark selected checkbox and transition onDecisionMade",
  async () => {
    let capturedState: StoryDecisionNode.State | undefined;
    const captureNext: Node<StoryDecisionNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const page = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const state = { ...baseState, storyPages: [page] };

    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => "2",
      print: () => {},
    };

    const result = StoryDecisionNode.create(
      { onDecisionMade: captureNext },
      utils,
    )(state);

    if (!result) throw new Error("Expected Next, got null");
    else await result();

    const updatedPage = capturedState?.storyPages[0] ?? "";
    assertEquals(updatedPage.includes("2. [x] Go right"), true);
    assertEquals(updatedPage.includes("1. [ ] Go left"), true);
  },
);

Deno.test(
  "storyDecisionNode should retry on invalid input then accept valid input",
  async () => {
    let capturedState: StoryDecisionNode.State | undefined;
    const captureNext: Node<StoryDecisionNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const page = "You must choose.\n1. [ ] Option A\n2. [ ] Option B";
    const state = { ...baseState, storyPages: [page] };

    let call = 0;
    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => ["bad", "99", "1"][call++],
      print: () => {},
    };

    const result = StoryDecisionNode.create(
      { onDecisionMade: captureNext },
      utils,
    )(state);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    const updatedPage = capturedState?.storyPages[0] ?? "";
    assertEquals(updatedPage.includes("1. [x] Option A"), true);
  },
);
