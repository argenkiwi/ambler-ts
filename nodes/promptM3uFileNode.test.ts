import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PromptM3uFileNode } from "./promptM3uFileNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("promptM3uFileNode should store entered path and transition to onEntered", async () => {
  const initialState: PromptM3uFileNode.State = { filePath: "", urls: [] };
  let capturedState: PromptM3uFileNode.State | undefined;
  const captureEntered: Nextable<PromptM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: PromptM3uFileNode.Utils = {
    readLine: async () => "/entered/file.m3u",
  };

  const nextResult = await PromptM3uFileNode.create(
    { onEntered: captureEntered },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "/entered/file.m3u");
});

Deno.test("promptM3uFileNode should return null when input is empty", async () => {
  const initialState: PromptM3uFileNode.State = { filePath: "", urls: [] };

  const utils: PromptM3uFileNode.Utils = {
    readLine: async () => "",
  };

  const nextResult = await PromptM3uFileNode.create(
    { onEntered: async () => null },
    utils,
  )(initialState);

  assertEquals(nextResult, null);
});

Deno.test("promptM3uFileNode should return null when input is null", async () => {
  const initialState: PromptM3uFileNode.State = { filePath: "", urls: [] };

  const utils: PromptM3uFileNode.Utils = {
    readLine: async () => null,
  };

  const nextResult = await PromptM3uFileNode.create(
    { onEntered: async () => null },
    utils,
  )(initialState);

  assertEquals(nextResult, null);
});
