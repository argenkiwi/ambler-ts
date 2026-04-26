import * as StoryIntroNode from "./storyIntroNode.ts";
import { Node, stop } from "../ambler.ts";
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
      { onIntroComplete: (_s) => stop(), onCancel: () => stop() },
      utils,
    )(baseState);

    let next = await result();
    while (typeof next === "function") {
      next = await next();
    }
    assertEquals(next, null);
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
      { onIntroComplete: (_s) => stop(), onCancel: () => stop() },
      utils,
    )(baseState);

    let next = await result();
    while (typeof next === "function") {
      next = await next();
    }
    assertEquals(next, null);
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
      { onIntroComplete: (_s) => stop(), onCancel: () => stop() },
      utils,
    )(baseState);

    let next = await result();
    while (typeof next === "function") {
      next = await next();
    }
    assertEquals(next, null);
  },
);

Deno.test(
  "storyIntroNode should set identity, placement, and circumstances trimmed",
  async () => {
    let capturedState: StoryIntroNode.State | undefined;
    const captureNext: Node<StoryIntroNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    let call = 0;
    const utils: StoryIntroNode.Utils = {
      readLine: (_msg) =>
        ["  Ada  ", "  London, 1842  ", "  Inventing the engine  "][call++],
      print: () => {},
    };

    const result = await StoryIntroNode.create(
      { onIntroComplete: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

    await result();

    assertEquals(capturedState?.identity, "Ada");
    assertEquals(capturedState?.placement, "London, 1842");
    assertEquals(capturedState?.circumstances, "Inventing the engine");
  },
);
