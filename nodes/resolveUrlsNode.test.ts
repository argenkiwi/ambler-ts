import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ResolveUrlsNode } from "./resolveUrlsNode.ts";
import { Nextable } from "../ambler.ts";

const KHINSIDER_URL = "https://downloads.khinsider.com/game-soundtracks/album/track.mp3";

Deno.test("resolveUrlsNode should resolve khinsider URLs and leave others unchanged", async () => {
  const initialState: ResolveUrlsNode.State = {
    urls: [KHINSIDER_URL, "https://example.com/other.mp3"],
  };
  let capturedState: ResolveUrlsNode.State | undefined;
  const captureDone: Nextable<ResolveUrlsNode.State> = async (s) => { capturedState = s; return null; };

  const utils: ResolveUrlsNode.Utils = {
    resolveUrl: async (url) => `https://cdn.example.com/resolved?from=${encodeURIComponent(url)}`,
  };

  const nextResult = await ResolveUrlsNode.create({ onDone: captureDone }, utils)(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.urls[0].startsWith("https://cdn.example.com/resolved"), true);
  assertEquals(capturedState?.urls[1], "https://example.com/other.mp3");
});

Deno.test("resolveUrlsNode should not call resolveUrl for non-khinsider URLs", async () => {
  const initialState: ResolveUrlsNode.State = {
    urls: ["https://example.com/track.mp3"],
  };
  let resolveCalled = false;
  let capturedState: ResolveUrlsNode.State | undefined;
  const captureDone: Nextable<ResolveUrlsNode.State> = async (s) => { capturedState = s; return null; };

  const utils: ResolveUrlsNode.Utils = {
    resolveUrl: async (url) => { resolveCalled = true; return url; },
  };

  const nextResult = await ResolveUrlsNode.create({ onDone: captureDone }, utils)(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(resolveCalled, false);
  assertEquals(capturedState?.urls, ["https://example.com/track.mp3"]);
});
