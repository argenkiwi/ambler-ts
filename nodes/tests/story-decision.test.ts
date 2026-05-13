import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../story-decision.ts";

Deno.test(
  "storyDecisionNode should return onSelect when there are no pages",
  async () => {
    const initialState: State = { story_pages: [] };

    const utils: Utils = {
      getPrompt: (_msg: string) => "1",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "page", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "page");
  },
);

Deno.test(
  "storyDecisionNode should return onSelect when last page has no checkbox options",
  async () => {
    const initialState: State = {
      story_pages: ["Once upon a time, there was a knight."],
    };

    const utils: Utils = {
      getPrompt: (_msg: string) => "1",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "page", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "page");
  },
);

Deno.test(
  "storyDecisionNode should mark chosen option and return onSelect",
  async () => {
    const initialState: State = {
      story_pages: [
        "The knight faces a dragon.\n\n- [ ] 1. Attack the dragon\n- [ ] 2. Run away",
      ],
    };

    const utils: Utils = {
      getPrompt: (_msg: string) => "1",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "page", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "page");
    const updatedPage = result[1].story_pages[0];
    assertEquals(updatedPage.includes("- [x] 1. Attack the dragon"), true);
    assertEquals(updatedPage.includes("- [ ] 2. Run away"), true);
  },
);

Deno.test(
  "storyDecisionNode should re-prompt on invalid input",
  async () => {
    const initialState: State = {
      story_pages: [
        "The knight faces a dragon.\n\n- [ ] 1. Attack the dragon\n- [ ] 2. Run away",
      ],
    };

    const prompts = ["99", "abc", "2"];
    let promptIndex = 0;

    const utils: Utils = {
      getPrompt: (_msg: string) => prompts[promptIndex++],
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "page", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "page");
    const updatedPage = result[1].story_pages[0];
    assertEquals(updatedPage.includes("- [x] 2. Run away"), true);
  },
);

Deno.test(
  "storyDecisionNode should cancel when user returns null",
  async () => {
    const initialState: State = {
      story_pages: [
        "The knight faces a dragon.\n\n- [ ] 1. Attack the dragon\n- [ ] 2. Run away",
      ],
    };

    const utils: Utils = {
      getPrompt: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "page", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "cancel");
  },
);

Deno.test(
  "storyDecisionNode should continue generating when user enters empty string",
  async () => {
    const initialState: State = {
      story_pages: [
        "The knight faces a dragon.\n\n- [ ] 1. Attack the dragon\n- [ ] 2. Run away",
      ],
    };

    const utils: Utils = {
      getPrompt: (_msg: string) => "",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "page", onCancel: "cancel" },
      utils,
    )(initialState);

    assertEquals(result[0], "page");
  },
);
