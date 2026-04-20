import * as ResolveUrlsNode from "./resolveUrlsNode.ts";
import { Nextable } from "../ambler.ts";
import { assertEquals } from "@std/assert";

const KHINSIDER_URL =
  "https://downloads.khinsider.com/game-soundtracks/game/01.mp3";
const OTHER_URL = "https://example.com/song.mp3";

Deno.test("resolveUrlsNode: resolves khinsider URLs and passes through others", async () => {
  let captured: ResolveUrlsNode.State | undefined;
  const captureNext: Nextable<ResolveUrlsNode.State> = (s) => {
    captured = s;
    return null;
  };

  const state: ResolveUrlsNode.State = {
    m3uFilePath: "playlist.m3u",
    urls: [KHINSIDER_URL, OTHER_URL],
  };

  const utils: ResolveUrlsNode.Utils = {
    resolveKhinsiderUrl: (_url) => Promise.resolve("https://cdn.example.com/01.mp3"),
    print: () => {},
  };

  const next = await ResolveUrlsNode.create({ onSuccess: captureNext }, utils)(
    state,
  );

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.urls, ["https://cdn.example.com/01.mp3", OTHER_URL]);
});

Deno.test("resolveUrlsNode: passes through all non-khinsider URLs unchanged", async () => {
  let captured: ResolveUrlsNode.State | undefined;
  const captureNext: Nextable<ResolveUrlsNode.State> = (s) => {
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

  const next = await ResolveUrlsNode.create({ onSuccess: captureNext }, utils)(
    state,
  );

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.urls, [OTHER_URL]);
});
