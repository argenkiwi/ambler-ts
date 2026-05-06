import { factory, Input, Utils } from "../storyDecisionNode.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "storyDecisionNode should call onError when storyPages is empty",
  async () => {
    const input: Input = { storyPages: [] };
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      {
        onDecisionMade: "made",
        onCancel: "cancel",
        onError: "error",
      },
      utils,
    )(input);

    assertEquals(result[0], "error");
    assertEquals(result[1], input);
  },
);

Deno.test(
  "storyDecisionNode should transition with unchanged state when no checkboxes found",
  async () => {
    const input: Input = { storyPages: ["You reach the end. The End"] };
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(input);

    assertEquals(result[0], "made");
    assertEquals(result[1].storyPages, input.storyPages);
  },
);

Deno.test(
  "storyDecisionNode should call onCancel when readLine returns null",
  async () => {
    const input: Input = {
      storyPages: [
        "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right",
      ],
    };

    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      {
        onDecisionMade: "made",
        onCancel: "cancel",
        onError: "error",
      },
      utils,
    )(input);

    assertEquals(result[0], "cancel");
    assertEquals(result[1], input);
  },
);

Deno.test(
  "storyDecisionNode should mark selected checkbox and transition onDecisionMade",
  async () => {
    const page = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const input: Input = { storyPages: [page] };

    const utils: Utils = {
      readLine: (_msg: string) => "2",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(input);

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
    const input: Input = { storyPages: [page] };

    let call = 0;
    const utils: Utils = {
      readLine: (_msg: string) => ["bad", "99", "1"][call++],
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(input);

    assertEquals(result[0], "made");
    const updatedPage = result[1].storyPages[0] ?? "";
    assertEquals(updatedPage.includes("1. [x] Option A"), true);
  },
);
