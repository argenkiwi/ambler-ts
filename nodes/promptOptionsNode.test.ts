import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PromptOptionsNode } from "./promptOptionsNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: PromptOptionsNode.State = {
  filePath: "/test.m3u",
  urls: ["https://example.com/track.mp3"],
};

const khinsiderState: PromptOptionsNode.State = {
  filePath: "/test.m3u",
  urls: ["https://downloads.khinsider.com/game-soundtracks/album/track.mp3"],
};

Deno.test("promptOptionsNode should transition to onList when list is selected", async () => {
  let capturedEdge = "";
  const onList: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "list"; return null; };
  const onResolve: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "resolve"; return null; };
  const onDownload: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "download"; return null; };

  const utils: PromptOptionsNode.Utils = {
    readLine: async () => "1",
    print: () => {},
  };

  const nextResult = await PromptOptionsNode.create(
    { onList, onResolve, onDownload },
    utils,
  )(baseState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedEdge, "list");
});

Deno.test("promptOptionsNode should transition to onDownload when no khinsider URLs and download is selected", async () => {
  let capturedEdge = "";
  const onList: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "list"; return null; };
  const onResolve: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "resolve"; return null; };
  const onDownload: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "download"; return null; };

  const utils: PromptOptionsNode.Utils = {
    readLine: async () => "2",
    print: () => {},
  };

  const nextResult = await PromptOptionsNode.create(
    { onList, onResolve, onDownload },
    utils,
  )(baseState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedEdge, "download");
});

Deno.test("promptOptionsNode should transition to onResolve when khinsider URLs present and resolve is selected", async () => {
  let capturedEdge = "";
  const onList: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "list"; return null; };
  const onResolve: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "resolve"; return null; };
  const onDownload: Nextable<PromptOptionsNode.State> = async () => { capturedEdge = "download"; return null; };

  const utils: PromptOptionsNode.Utils = {
    readLine: async () => "2",
    print: () => {},
  };

  const nextResult = await PromptOptionsNode.create(
    { onList, onResolve, onDownload },
    utils,
  )(khinsiderState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedEdge, "resolve");
});

Deno.test("promptOptionsNode should return null when quit is selected", async () => {
  const utils: PromptOptionsNode.Utils = {
    readLine: async () => "3",
    print: () => {},
  };

  const nextResult = await PromptOptionsNode.create(
    { onList: async () => null, onResolve: async () => null, onDownload: async () => null },
    utils,
  )(baseState);

  assertEquals(nextResult, null);
});
