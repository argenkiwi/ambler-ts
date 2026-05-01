import storySaveNode, { State, Utils } from "../storySaveNode.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
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

    const utils: Utils = {
      saveFile: (_filename: string, content: string) => {
        savedContent = content;
        return Promise.resolve();
      },
      print: (_msg: string) => {},
    };

    const result = await storySaveNode(
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
    const utils: Utils = {
      saveFile: (_filename: string, _content: string) => {
        throw new Error("disk full");
      },
      print: (_msg: string) => {},
    };

    const result = await storySaveNode(
      { onSaveComplete: "complete" },
      utils,
    )(baseState);

    assertEquals(result[0], "complete");
    assertEquals(result[1].storyPages, baseState.storyPages);
  },
);
