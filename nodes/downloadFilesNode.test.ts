import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DownloadFilesNode } from "./downloadFilesNode.ts";

Deno.test("downloadFilesNode should download all URLs to folder derived from filePath", async () => {
  const initialState: DownloadFilesNode.State = {
    filePath: "/music/my-album.m3u",
    urls: ["https://example.com/a.mp3", "https://example.com/b.mp3"],
  };
  const downloads: Array<{ url: string; folder: string }> = [];

  const utils: DownloadFilesNode.Utils = {
    downloadFile: async (url, folder) => { downloads.push({ url, folder }); },
    print: () => {},
  };

  const result = await DownloadFilesNode.create(utils)(initialState);

  assertEquals(result, null);
  assertEquals(downloads.length, 2);
  assertEquals(downloads[0].folder, "my-album");
  assertEquals(downloads[1].folder, "my-album");
});

Deno.test("downloadFilesNode should strip .m3u extension for folder name", async () => {
  const initialState: DownloadFilesNode.State = {
    filePath: "playlist.m3u",
    urls: ["https://example.com/track.mp3"],
  };
  let capturedFolder = "";

  const utils: DownloadFilesNode.Utils = {
    downloadFile: async (_url, folder) => { capturedFolder = folder; },
    print: () => {},
  };

  await DownloadFilesNode.create(utils)(initialState);

  assertEquals(capturedFolder, "playlist");
});

Deno.test("downloadFilesNode should return null", async () => {
  const initialState: DownloadFilesNode.State = {
    filePath: "/test.m3u",
    urls: [],
  };

  const utils: DownloadFilesNode.Utils = {
    downloadFile: async () => {},
    print: () => {},
  };

  const result = await DownloadFilesNode.create(utils)(initialState);

  assertEquals(result, null);
});
