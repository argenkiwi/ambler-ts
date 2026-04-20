import * as SaveM3UFileNode from "./saveM3UFileNode.ts";
import { Nextable } from "../ambler.ts";
import { assertEquals } from "@std/assert";

Deno.test("saveM3UFileNode: writes urls joined by newlines to filePath", async () => {
  let writtenPath: string | undefined;
  let writtenContent: string | undefined;

  const state: SaveM3UFileNode.State = {
    m3uFilePath: "playlist.m3u",
    urls: ["https://a.com/1.mp3", "https://b.com/2.mp3"],
  };

  const utils: SaveM3UFileNode.Utils = {
    writeFile: (path, content) =>
      Promise.resolve().then(() => {
        writtenPath = path;
        writtenContent = content;
      }),
    print: () => {},
  };

  const next = await SaveM3UFileNode.create(
    { onSuccess: () => null },
    utils,
  )(state);

  if (!next) throw new Error("Expected Next, got null");

  assertEquals(writtenPath, "playlist.m3u");
  assertEquals(writtenContent, "https://a.com/1.mp3\nhttps://b.com/2.mp3");
});

Deno.test("saveM3UFileNode: transitions to onSuccess with same state", async () => {
  let captured: SaveM3UFileNode.State | undefined;
  const captureNext: Nextable<SaveM3UFileNode.State> = (s) => {
    captured = s;
    return null;
  };

  const state: SaveM3UFileNode.State = {
    m3uFilePath: "output.m3u",
    urls: ["https://example.com/track.mp3"],
  };

  const next = await SaveM3UFileNode.create(
    { onSuccess: captureNext },
    { writeFile: async () => {}, print: () => {} },
  )(state);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.m3uFilePath, "output.m3u");
  assertEquals(captured?.urls, ["https://example.com/track.mp3"]);
});
