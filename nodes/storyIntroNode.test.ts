import * as StoryIntroNode from "./storyIntroNode.ts";
import { Nextable } from "../ambler.ts";
import { assertEquals } from "@std/assert";

const baseState: StoryIntroNode.State = {
  identity: "",
  placement: "",
  circumstances: "",
};

Deno.test(
  "storyIntroNode should return null when identity readLine returns null",
  async () => {
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "storyIntroNode should return null when placement readLine returns null",
  async () => {
    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: async (_msg) => (call++ === 0 ? "Ada" : null),
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "storyIntroNode should return null when circumstances readLine returns null",
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
      { onIntroComplete: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "storyIntroNode should set identity, placement, and circumstances trimmed",
  async () => {
    let capturedState: StoryIntroNode.State | undefined;
    const captureNext: Nextable<StoryIntroNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: async (_msg) =>
        ["  Ada  ", "  London, 1842  ", "  Inventing the engine  "][call++],
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.identity, "Ada");
    assertEquals(capturedState?.placement, "London, 1842");
    assertEquals(capturedState?.circumstances, "Inventing the engine");
  },
);
