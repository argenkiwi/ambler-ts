import * as StorySaveNode from "./storySaveNode.ts";
import { assertEquals } from "@std/assert";

const baseState: StorySaveNode.State = {
  selectedModel: "llama3",
  identity: "Ada",
  placement: "London",
  circumstances: "Crisis",
  storyPages: ["Page one.", "Page two."],
};

Deno.test(
  "storySaveNode should call saveFile with joined pages and transition onSaveComplete",
  async () => {
    let savedContent: string | undefined;

    const utils: StorySaveNode.Utils = {
      saveFile: (_filename, content) => {
        savedContent = content;
        return Promise.resolve();
      },
      print: () => {},
    };

    const result = await StorySaveNode.create(
      { onSaveComplete: "complete" },
      utils,
    )(baseState);

    assertEquals(result[0], "complete");
    assertEquals(savedContent, "Page one.\n\nPage two.");
    assertEquals(result[1].storyPages, baseState.storyPages);
  },
);

Deno.test(
  "storySaveNode should still transition onSaveComplete when saveFile throws",
  async () => {
    const utils: StorySaveNode.Utils = {
      saveFile: (_filename, _content) => {
        throw new Error("disk full");
      },
      print: () => {},
    };

    const result = await StorySaveNode.create(
      { onSaveComplete: "complete" },
      utils,
    )(baseState);

    assertEquals(result[0], "complete");
    assertEquals(result[1].storyPages, baseState.storyPages);
  },
);
