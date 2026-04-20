import { assertEquals } from "@std/assert";
import * as ReadM3UFileNode from "./readM3UFileNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: ReadM3UFileNode.State = {
  m3uFilePath: "playlist.m3u",
  urls: [],
};

function makeUtils(content: string): ReadM3UFileNode.Utils {
  return {
    readFile: () => Promise.resolve(content),
    print: () => {},
  };
}

Deno.test("readM3UFileNode: parses URLs and ignores comments/empty lines", async () => {
  let captured: ReadM3UFileNode.State | undefined;
  const captureNext: Nextable<ReadM3UFileNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const content = "#EXTM3U\nhttps://example.com/song.mp3\n\n# comment\nhttps://other.com/track.mp3\n";
  const next = await ReadM3UFileNode.create(
    { onHasKhinsider: () => null, onNoKhinsider: captureNext },
    makeUtils(content),
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.urls, [
    "https://example.com/song.mp3",
    "https://other.com/track.mp3",
  ]);
});

Deno.test("readM3UFileNode: transitions to onHasKhinsider when khinsider URL found", async () => {
  let wentToKhinsider = false;
  const khinsiderNext: Nextable<ReadM3UFileNode.State> = () => {
    wentToKhinsider = true;
    return null;
  };

  const khinsiderUrl = "https://downloads.khinsider.com/game-soundtracks/album/game/01.mp3";
  const next = await ReadM3UFileNode.create(
    { onHasKhinsider: khinsiderNext, onNoKhinsider: () => null },
    makeUtils(khinsiderUrl),
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(wentToKhinsider, true);
});

Deno.test("readM3UFileNode: transitions to onNoKhinsider when no khinsider URLs", async () => {
  let wentToNoKhinsider = false;
  const noKhinsiderNext: Nextable<ReadM3UFileNode.State> = () => {
    wentToNoKhinsider = true;
    return null;
  };

  const next = await ReadM3UFileNode.create(
    { onHasKhinsider: () => null, onNoKhinsider: noKhinsiderNext },
    makeUtils("https://example.com/song.mp3"),
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(wentToNoKhinsider, true);
});
