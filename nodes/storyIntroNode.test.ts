import * as StoryIntroNode from "./storyIntroNode.ts";
import { assertEquals } from "@std/assert";

const baseState: StoryIntroNode.State = {
  identity: "",
  placement: "",
  circumstances: "",
};

Deno.test(
  "storyIntroNode should call onCancel when identity readLine returns null",
  () => {
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "cancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "storyIntroNode should call onCancel when placement readLine returns null",
  () => {
    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) => (call++ === 0 ? "Ada" : null),
      print: () => {},
    };

    const result = StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "cancel");
    assertEquals(result[1], baseState);
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

    assertEquals(result[0], "cancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "storyIntroNode should set identity, placement, and circumstances trimmed",
  () => {
    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) =>
        ["  Ada  ", "  London, 1842  ", "  Inventing the engine  "][call++],
      print: () => {},
    };

    const result = StoryIntroNode.create(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "complete");
    assertEquals(result[1].identity, "Ada");
    assertEquals(result[1].placement, "London, 1842");
    assertEquals(result[1].circumstances, "Inventing the engine");
  },
);
