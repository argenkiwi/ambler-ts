import storyIntroNode, { State, Utils } from "../storyIntroNode.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  identity: "",
  placement: "",
  circumstances: "",
};

Deno.test(
  "storyIntroNode should call onCancel when identity readLine returns null",
  async () => {
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await storyIntroNode(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "cancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "storyIntroNode should call onCancel when placement readLine returns null",
  async () => {
    let call = 0;
    const utils: Utils = {
      readLine: (_msg: string) => (call++ === 0 ? "Ada" : null),
      print: (_msg: string) => {},
    };

    const result = await storyIntroNode(
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
    const utils: Utils = {
      readLine: (_msg: string) => {
        const responses = ["Ada", "London, 1842", null];
        return responses[call++];
      },
      print: (_msg: string) => {},
    };

    const result = await storyIntroNode(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "cancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "storyIntroNode should set identity, placement, and circumstances trimmed",
  async () => {
    let call = 0;
    const utils: Utils = {
      readLine: (_msg: string) =>
        ["  Ada  ", "  London, 1842  ", "  Inventing the engine  "][call++],
      print: (_msg: string) => {},
    };

    const result = await storyIntroNode(
      { onIntroComplete: "complete", onCancel: "cancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "complete");
    assertEquals(result[1].identity, "Ada");
    assertEquals(result[1].placement, "London, 1842");
    assertEquals(result[1].circumstances, "Inventing the engine");
  },
);
