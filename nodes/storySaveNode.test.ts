import * as StorySaveNode from "./storySaveNode.ts";
import { Node } from "../ambler.ts";
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
    let capturedState: StorySaveNode.State | undefined;
    const captureNext: Node<StorySaveNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: StorySaveNode.Utils = {
      saveFile: (_filename, content) => {
        savedContent = content;
        return Promise.resolve();
      },
      print: () => {},
    };

    const result = await StorySaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    result();

    assertEquals(savedContent, "Page one.\n\nPage two.");
    assertEquals(capturedState?.storyPages, baseState.storyPages);
  },
);

Deno.test(
  "storySaveNode should still transition onSaveComplete when saveFile throws",
  async () => {
    let capturedState: StorySaveNode.State | undefined;
    const captureNext: Node<StorySaveNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: StorySaveNode.Utils = {
      saveFile: (_filename, _content) => {
        throw new Error("disk full");
      },
      print: () => {},
    };

    const result = await StorySaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    assertEquals(capturedState?.storyPages, baseState.storyPages);
  },
);
