import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ReadM3uFileNode } from "./readM3uFileNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("readM3uFileNode should parse URLs and skip comments and blank lines", async () => {
  const initialState: ReadM3uFileNode.State = { filePath: "/test.m3u", urls: [] };
  let capturedState: ReadM3uFileNode.State | undefined;
  const captureRead: Nextable<ReadM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: ReadM3uFileNode.Utils = {
    readFile: async () =>
      "#EXTM3U\n\nhttps://example.com/track1.mp3\n# comment\nhttps://example.com/track2.mp3\n",
  };

  const nextResult = await ReadM3uFileNode.create(
    { onRead: captureRead },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.urls, [
    "https://example.com/track1.mp3",
    "https://example.com/track2.mp3",
  ]);
});

Deno.test("readM3uFileNode should preserve the filePath in state", async () => {
  const initialState: ReadM3uFileNode.State = { filePath: "/test.m3u", urls: [] };
  let capturedState: ReadM3uFileNode.State | undefined;
  const captureRead: Nextable<ReadM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: ReadM3uFileNode.Utils = {
    readFile: async () => "https://example.com/track1.mp3",
  };

  const nextResult = await ReadM3uFileNode.create(
    { onRead: captureRead },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "/test.m3u");
});
