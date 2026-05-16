import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../downloadFiles.ts";

Deno.test(
  "downloadFilesNode should download all files and return correct state",
  async () => {
    const initialState: State = {
      m3uFilePath: "/music/game.m3u",
      urls: [
        "https://example.com/audio1.mp3",
        "https://example.com/audio2.mp3",
      ],
    };

    let removed = "";
    const utils: Utils = {
      downloadFile: async (url: string, _folder: string) =>
        `/music/game/${url.split("/").pop()}`,
      remove: (path: string) => {
        removed = path;
        return Promise.resolve();
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "DONE" },
      utils,
    )(initialState);

    assertEquals(edge, "DONE");
    assertEquals(removed, "/music/game.m3u");
    assertEquals(state.urls.length, 2);
    assertEquals(state.urls[0].startsWith("file://"), true);
  },
);

Deno.test(
  "downloadFilesNode should extract output folder name from m3u basename",
  async () => {
    const initialState: State = {
      m3uFilePath: "/music/my-game.m3u",
      urls: ["https://example.com/song.mp3"],
    };

    let lastFolder = "";
    const utils: Utils = {
      downloadFile: async (url: string, folder: string) => {
        lastFolder = folder;
        return `/music/my-song.mp3`;
      },
      remove: async (_path: string) => {},
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "DONE" },
      utils,
    )(initialState);

    assertEquals(edge, "DONE");
    assertEquals(lastFolder, "my-game");
    assertEquals(state.urls.length, 1);
  },
);

Deno.test(
  "downloadFilesNode should handle empty URL list",
  async () => {
    const initialState: State = { m3uFilePath: "/music/empty.m3u", urls: [] };

    const utils: Utils = {
      downloadFile: async () => "",
      remove: async (_path: string) => {},
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "DONE" },
      utils,
    )(initialState);

    assertEquals(edge, "DONE");
    assertEquals(state.urls.length, 0);
  },
);
