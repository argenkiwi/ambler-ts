
import * as DownloadFilesNode from "./downloadFilesNode.ts";
import { Nextable } from "../ambler.ts";
import { assertEquals } from "@std/assert";

Deno.test("downloadFilesNode: downloads files, removes original, updates state", async () => {
  let removedPath: string | undefined;
  let captured: DownloadFilesNode.State | undefined;
  const captureNext: Nextable<DownloadFilesNode.State> =  (s) => {
    captured = s;
    return null;
  };

  const state: DownloadFilesNode.State = {
    m3uFilePath: "my-game.m3u",
    urls: [
      "https://cdn.example.com/01.mp3",
      "https://cdn.example.com/02.mp3",
    ],
  };

  const utils: DownloadFilesNode.Utils = {
    downloadFile: (url, folder) => Promise.resolve(`${folder}/${url.split("/").pop()}`),
    remove: (path) => Promise.resolve().then(() => { removedPath = path; }),
    print: () => {},
  };

  const next = await DownloadFilesNode.create({ onSuccess: captureNext }, utils)(state);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(removedPath, "my-game.m3u");
  assertEquals(captured?.m3uFilePath, "my-game/playlist.m3u");
  assertEquals(captured?.urls, [
    "file://my-game/01.mp3",
    "file://my-game/02.mp3",
  ]);
});
