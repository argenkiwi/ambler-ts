import * as StoryIntroNode from "./storyIntroNode.ts";
import { assertEquals } from "@std/assert";

const baseState: StoryIntroNode.State = {
  identity: "",
  placement: "",
  circumstances: "",
};

Deno.test(
  "storyIntroNode should call onCancel when identity readLine returns null",
  async () => {
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "cancel");
    assertEquals(result.state, baseState);
  },
);

Deno.test(
  "storyIntroNode should call onCancel when placement readLine returns null",
  async () => {
    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) => (call++ === 0 ? "Ada" : null),
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "cancel");
    assertEquals(result.state, baseState);
  },
);

Deno.test(
  "storyIntroNode should call onCancel when circumstances readLine returns null",
  async () => {
    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) => {
        const responses = ["Ada", "London, 1842", null];
        return responses[call++];
      },
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "cancel");
    assertEquals(result.state, baseState);
  },
);

Deno.test(
  "storyIntroNode should set identity, placement, and circumstances trimmed",
  async () => {
    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) =>
        ["  Ada  ", "  London, 1842  ", "  Inventing the engine  "][call++],
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "complete");
    assertEquals(result.state.identity, "Ada");
    assertEquals(result.state.placement, "London, 1842");
    assertEquals(result.state.circumstances, "Inventing the engine");
  },
);
