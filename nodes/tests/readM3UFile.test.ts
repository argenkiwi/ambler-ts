import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../readM3UFile.ts";

Deno.test(
  "readM3UFileNode should transition to onHasKhinsider when URLs contain khinsider prefix",
  async () => {
    const initialState: State = {
      m3uFilePath: "/path/playlist.m3u",
      urls: [],
    };

    const utils: Utils = {
      readFile: async (_path: string) =>
        "#EXTINF\nhttps://example.com/song.mp3\nhttps://downloads.khinsider.com/game-soundtracks/MyGame/song.mp3",
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onHasKhinsider: "RESOLVE", onNoKhinsider: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, "RESOLVE");
    assertEquals(state.urls.length, 2);
  },
);

Deno.test(
  "readM3UFileNode should transition to onNoKhinsider when URLs have no khinsider prefix",
  async () => {
    const initialState: State = {
      m3uFilePath: "/path/playlist.m3u",
      urls: [],
    };

    const utils: Utils = {
      readFile: async (_path: string) =>
        "#EXTINF\n\nhttps://example.com/song1.mp3\n\nhttps://example.com/song2.mp3",
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onHasKhinsider: "RESOLVE", onNoKhinsider: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, "DOWNLOAD");
    assertEquals(state.urls.length, 2);
    assertEquals(state.urls[0], "https://example.com/song1.mp3");
    assertEquals(state.urls[1], "https://example.com/song2.mp3");
  },
);

Deno.test(
  "readM3UFileNode should skip empty and comment lines",
  async () => {
    const initialState: State = {
      m3uFilePath: "/path/playlist.m3u",
      urls: [],
    };

    const utils: Utils = {
      readFile: async (_path: string) =>
        "#EXTM3U\n# Comment line\n#EXTINF:123,Artist - Song\nhttps://example.com/song.mp3\n",
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onHasKhinsider: "RESOLVE", onNoKhinsider: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, "DOWNLOAD");
    assertEquals(state.urls.length, 1);
    assertEquals(state.urls[0], "https://example.com/song.mp3");
  },
);
