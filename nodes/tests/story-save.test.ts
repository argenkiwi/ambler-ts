import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../story-save.ts";

Deno.test("storySaveNode should write file and transition to onDone", async () => {
  const initialState: State = {
    story_pages: ["Page one content.", "Page two content."],
  };

  let writtenPath = "";
  let writtenContent = "";

  const utils: Utils = {
    writeFile: async (path: string, content: string) => {
      writtenPath = path;
      writtenContent = content;
    },
    createDir: async (_path: string) => {},
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onDone: null },
    utils,
  )(initialState);

  assertEquals(result[0], null);
  assertEquals(writtenPath.startsWith("cyoa/"), true);
  assertEquals(writtenPath.endsWith(".md"), true);
  assertEquals(writtenContent, "Page one content.\n\n---\n\nPage two content.");
});

Deno.test("storySaveNode should handle write errors gracefully", async () => {
  const initialState: State = {
    story_pages: ["Page content."],
  };

  let printedMsg = "";

  const utils: Utils = {
    writeFile: async () => {
      throw new Error("Permission denied");
    },
    createDir: async (_path: string) => Promise.resolve(),
    print: (msg: string) => {
      printedMsg = msg;
    },
  };

  const result = await factory(
    { onDone: null },
    utils,
  )(initialState);

  assertEquals(result[0], null);
  assertEquals(printedMsg.includes("Error saving story"), true);
});
