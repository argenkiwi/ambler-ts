import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { SaveM3uFileNode } from "./saveM3uFileNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("saveM3uFileNode should write URLs joined by newline to the file", async () => {
  const initialState: SaveM3uFileNode.State = {
    filePath: "/test.m3u",
    urls: ["https://example.com/a.mp3", "https://example.com/b.mp3"],
  };
  let writtenPath = "";
  let writtenContent = "";

  const utils: SaveM3uFileNode.Utils = {
    writeFile: async (path, content) => { writtenPath = path; writtenContent = content; },
  };

  const nextResult = await SaveM3uFileNode.create(
    { onSaved: async () => null },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(writtenPath, "/test.m3u");
  assertEquals(writtenContent, "https://example.com/a.mp3\nhttps://example.com/b.mp3");
});

Deno.test("saveM3uFileNode should transition to onSaved", async () => {
  const initialState: SaveM3uFileNode.State = { filePath: "/test.m3u", urls: [] };
  let capturedState: SaveM3uFileNode.State | undefined;
  const captureSaved: Nextable<SaveM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: SaveM3uFileNode.Utils = {
    writeFile: async () => {},
  };

  const nextResult = await SaveM3uFileNode.create({ onSaved: captureSaved }, utils)(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "/test.m3u");
});
