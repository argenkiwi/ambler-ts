import storyDecisionNode, { State, Utils } from "../storyDecisionNode.ts";
import { assertEquals } from "@std/assert/equals";

const baseState: State = {
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
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await storyDecisionNode(
      {
        onDecisionMade: "made",
        onCancel: "cancel",
        onError: "error",
      },
      utils,
    )(baseState);

    assertEquals(result[0], "error");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "storyDecisionNode should transition with unchanged state when no checkboxes found",
  async () => {
    const state = { ...baseState, storyPages: ["You reach the end. The End"] };
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await storyDecisionNode(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(state);

    assertEquals(result[0], "made");
    assertEquals(result[1].storyPages, state.storyPages);
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

    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await storyDecisionNode(
      {
        onDecisionMade: "made",
        onCancel: "cancel",
        onError: "error",
      },
      utils,
    )(state);

    assertEquals(result[0], "cancel");
    assertEquals(result[1], state);
  },
);

Deno.test(
  "storyDecisionNode should mark selected checkbox and transition onDecisionMade",
  async () => {
    const page = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const state = { ...baseState, storyPages: [page] };

    const utils: Utils = {
      readLine: (_msg: string) => "2",
      print: (_msg: string) => {},
    };

    const result = await storyDecisionNode(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(state);

    assertEquals(result[0], "made");
    const updatedPage = result[1].storyPages[0] ?? "";
    assertEquals(updatedPage.includes("2. [x] Go right"), true);
    assertEquals(updatedPage.includes("1. [ ] Go left"), true);
  },
);

Deno.test(
  "storyDecisionNode should retry on invalid input then accept valid input",
  async () => {
    const page = "You must choose.\n1. [ ] Option A\n2. [ ] Option B";
    const state = { ...baseState, storyPages: [page] };

    let call = 0;
    const utils: Utils = {
      readLine: (_msg: string) => ["bad", "99", "1"][call++],
      print: (_msg: string) => {},
    };

    const result = await storyDecisionNode(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(state);

    assertEquals(result[0], "made");
    const updatedPage = result[1].storyPages[0] ?? "";
    assertEquals(updatedPage.includes("1. [x] Option A"), true);
  },
);
