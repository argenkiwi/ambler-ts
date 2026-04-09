import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ResolveUrlsNode } from "./resolveUrlsNode.ts";
import { Nextable } from "../ambler.ts";

const KHINSIDER_URL = "https://downloads.khinsider.com/game-soundtracks/game/01.mp3";
const OTHER_URL = "https://example.com/song.mp3";

Deno.test("resolveUrlsNode: resolves khinsider URLs and passes through others", async () => {
  let captured: ResolveUrlsNode.State | undefined;
  const captureNext: Nextable<ResolveUrlsNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const state: ResolveUrlsNode.State = {
    m3uFilePath: "playlist.m3u",
    urls: [KHINSIDER_URL, OTHER_URL],
  };

  const utils: ResolveUrlsNode.Utils = {
    resolveKhinsiderUrl: async (_url) => "https://cdn.example.com/01.mp3",
    print: () => {},
  };

  const next = await ResolveUrlsNode.create({ onSuccess: captureNext }, utils)(state);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.urls, ["https://cdn.example.com/01.mp3", OTHER_URL]);
});

Deno.test("resolveUrlsNode: passes through all non-khinsider URLs unchanged", async () => {
  let captured: ResolveUrlsNode.State | undefined;
  const captureNext: Nextable<ResolveUrlsNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const state: ResolveUrlsNode.State = {
    m3uFilePath: "playlist.m3u",
    urls: [OTHER_URL],
  };

  const utils: ResolveUrlsNode.Utils = {
    resolveKhinsiderUrl: async () => {
      throw new Error("Should not be called");
    },
    print: () => {},
  };

  const next = await ResolveUrlsNode.create({ onSuccess: captureNext }, utils)(state);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.urls, [OTHER_URL]);
});
