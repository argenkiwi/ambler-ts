import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../story-intro.ts";

Deno.test(
  "storyIntroNode should collect all three fields and transition to onComplete",
  async () => {
    const initialState: State = {
      identity: "",
      placement: "",
      circumstances: "",
    };

    const prompts = [
      "A brave knight",
      "A medieval kingdom in 1200 AD",
      "Discovering a mysterious sword",
    ];
    let promptIndex = 0;

    const utils: Utils = {
      getPrompt: (_msg: string) => prompts[promptIndex++],
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onComplete: "next", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "next");
    assertEquals(result[1].identity, "A brave knight");
    assertEquals(result[1].placement, "A medieval kingdom in 1200 AD");
    assertEquals(
      result[1].circumstances,
      "Discovering a mysterious sword",
    );
  },
);

Deno.test(
  "storyIntroNode should cancel when identity prompt returns null",
  async () => {
    const initialState: State = {
      identity: "",
      placement: "",
      circumstances: "",
    };

    const utils: Utils = {
      getPrompt: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onComplete: "next", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "cancel");
    assertEquals(result[1].identity, "");
  },
);

Deno.test(
  "storyIntroNode should cancel when placement prompt returns null",
  async () => {
    const initialState: State = {
      identity: "",
      placement: "",
      circumstances: "",
    };

    const prompts = ["A brave knight", null];
    let promptIndex = 0;

    const utils: Utils = {
      getPrompt: (_msg: string) => prompts[promptIndex++],
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onComplete: "next", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "cancel");
  },
);

Deno.test(
  "storyIntroNode should cancel when circumstances prompt returns null",
  async () => {
    const initialState: State = {
      identity: "",
      placement: "",
      circumstances: "",
    };

    const prompts = ["A brave knight", "A medieval kingdom", null];
    let promptIndex = 0;

    const utils: Utils = {
      getPrompt: (_msg: string) => prompts[promptIndex++],
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onComplete: "next", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "cancel");
    assertEquals(result[1].circumstances, "");
  },
);
