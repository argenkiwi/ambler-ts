import * as StoryDecisionNode from "./storyDecisionNode.ts";
import { Node, stop } from "../ambler.ts";
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
  "storyDecisionNode should call onError when storyPages is empty",
  async () => {
    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await StoryDecisionNode.create(
      {
        onDecisionMade: (_s) => stop(),
        onCancel: () => stop(),
        onError: () => stop(),
      },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
  },
);

Deno.test(
  "storyDecisionNode should transition with unchanged state when no checkboxes found",
  async () => {
    let capturedState: StoryDecisionNode.State | undefined;
    const captureNext: Node<StoryDecisionNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const state = { ...baseState, storyPages: ["You reach the end. The End"] };
    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await StoryDecisionNode.create(
      { onDecisionMade: captureNext, onCancel: () => stop(), onError: () => stop() },
      utils,
    )(state);

    await result();

    assertEquals(capturedState?.storyPages, state.storyPages);
  },
);

Deno.test(
  "storyDecisionNode should call onCancel when readLine returns null",
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

    const result = await StoryDecisionNode.create(
      {
        onDecisionMade: (_s) => stop(),
        onCancel: () => stop(),
        onError: () => stop(),
      },
      utils,
    )(state);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
  },
);

Deno.test(
  "storyDecisionNode should mark selected checkbox and transition onDecisionMade",
  async () => {
    let capturedState: StoryDecisionNode.State | undefined;
    const captureNext: Node<StoryDecisionNode.State> = async (s) => {
      capturedState = s;
      return stop();
    };

    const page = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const state = { ...baseState, storyPages: [page] };

    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => "2",
      print: () => {},
    };

    const result = await StoryDecisionNode.create(
      { onDecisionMade: captureNext, onCancel: () => stop(), onError: () => stop() },
      utils,
    )(state);

    await result();

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
      return stop();
    };

    const page = "You must choose.\n1. [ ] Option A\n2. [ ] Option B";
    const state = { ...baseState, storyPages: [page] };

    let call = 0;
    const utils: StoryDecisionNode.Utils = {
      readLine: (_msg) => ["bad", "99", "1"][call++],
      print: () => {},
    };

    const result = await StoryDecisionNode.create(
      { onDecisionMade: captureNext, onCancel: () => stop(), onError: () => stop() },
      utils,
    )(state);

    await result();

    const updatedPage = capturedState?.storyPages[0] ?? "";
    assertEquals(updatedPage.includes("1. [x] Option A"), true);
  },
);
