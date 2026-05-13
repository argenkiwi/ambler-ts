import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../story-page.ts";

Deno.test("storyPageNode should add a new page and transition to onStoryEnd when page contains The End", async () => {
  const initialState: State = {
    host: "http://localhost:11434",
    model: "llama3",
    identity: "A knight",
    placement: "A castle",
    circumstances: "Finding a sword",
    story_pages: [],
    current_page: 1,
  };

  const utils: Utils = {
    chat: async () => "Once upon a time, a knight found a sword.\n\nThe End",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onStoryEnd: "save", onStoryContinue: "decision" },
    utils,
  )(initialState);

  assertEquals(result[0], "save");
  assertEquals(result[1].story_pages.length, 1);
  assertEquals(result[1].current_page, 2);
});

Deno.test("storyPageNode should transition to onStoryContinue when page has checkbox options", async () => {
  const initialState: State = {
    host: "http://localhost:11434",
    model: "llama3",
    identity: "A knight",
    placement: "A castle",
    circumstances: "Finding a sword",
    story_pages: [],
    current_page: 1,
  };

  const utils: Utils = {
    chat: async () =>
      "The knight draws the sword and faces a dragon.\n\n- [ ] 1. Attack the dragon\n- [ ] 2. Negotiate with the dragon",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onStoryEnd: "save", onStoryContinue: "decision" },
    utils,
  )(initialState);

  assertEquals(result[0], "decision");
  assertEquals(result[1].story_pages.length, 1);
  assertEquals(result[1].current_page, 2);
});

Deno.test("storyPageNode should append to existing pages", async () => {
  const initialState: State = {
    host: "http://localhost:11434",
    model: "llama3",
    identity: "A knight",
    placement: "A castle",
    circumstances: "Finding a sword",
    story_pages: ["The knight enters the castle."],
    current_page: 2,
  };

  const utils: Utils = {
    chat: async () => "The knight finds a sword in a room.\n\n- [ ] 1. Pick up the sword\n- [ ] 2. Leave the sword",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onStoryEnd: "save", onStoryContinue: "decision" },
    utils,
  )(initialState);

  assertEquals(result[1].story_pages.length, 2);
  assertEquals(result[1].story_pages[0], "The knight enters the castle.");
  assertEquals(result[1].current_page, 3);
});
