import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as StorySaveNode from "./storySaveNode.ts";
import { Nextable } from "../ambler.ts";

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
    const captureNext: Nextable<StorySaveNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: StorySaveNode.Utils = {
      saveFile: async (_filename, content) => {
        savedContent = content;
      },
      print: () => {},
    };

    const result = await StorySaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(savedContent, "Page one.\n\nPage two.");
    assertEquals(capturedState?.storyPages, baseState.storyPages);
  },
);

Deno.test(
  "storySaveNode should still transition onSaveComplete when saveFile throws",
  async () => {
    let capturedState: StorySaveNode.State | undefined;
    const captureNext: Nextable<StorySaveNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: StorySaveNode.Utils = {
      saveFile: async (_filename, _content) => {
        throw new Error("disk full");
      },
      print: () => {},
    };

    const result = await StorySaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.storyPages, baseState.storyPages);
  },
);
