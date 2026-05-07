import { factory, Utils } from "../storyDecision.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "storyDecisionNode should call onError when storyPages is empty",
  () => {
    const input: string[] = [];
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = factory(
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
  () => {
    const input: string[] = ["You reach the end. The End"];
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = factory(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(input);

    assertEquals(result[0], "made");
    assertEquals(result[1], input);
  },
);

Deno.test(
  "storyDecisionNode should call onCancel when readLine returns null",
  () => {
    const input: string[] = [
      "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right",
    ];

    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = factory(
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
  () => {
    const page = "You stand at a crossroads.\n1. [ ] Go left\n2. [ ] Go right";
    const input: string[] = [page];

    const utils: Utils = {
      readLine: (_msg: string) => "2",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(input);

    assertEquals(result[0], "made");
    const updatedPage = result[1][0] ?? "";
    assertEquals(updatedPage.includes("2. [x] Go right"), true);
    assertEquals(updatedPage.includes("1. [ ] Go left"), true);
  },
);

Deno.test(
  "storyDecisionNode should retry on invalid input then accept valid input",
  () => {
    const page = "You must choose.\n1. [ ] Option A\n2. [ ] Option B";
    const input: string[] = [page];

    let call = 0;
    const utils: Utils = {
      readLine: (_msg: string) => ["bad", "99", "1"][call++],
      print: (_msg: string) => {},
    };

    const result = factory(
      { onDecisionMade: "made", onCancel: "cancel", onError: "error" },
      utils,
    )(input);

    assertEquals(result[0], "made");
    const updatedPage = result[1][0] ?? "";
    assertEquals(updatedPage.includes("1. [x] Option A"), true);
  },
);
