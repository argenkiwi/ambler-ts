import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../resolveUrls.ts";

Deno.test(
  "resolveUrlsNode should resolve khinsider URLs and keep others unchanged",
  async () => {
    const initialState: State = {
      m3uFilePath: "/path/playlist.m3u",
      urls: [
        "https://example.com/audio.mp3",
        "https://downloads.khinsider.com/game-soundtracks/TGAS/audio.mp3",
      ],
    };

    const utils: Utils = {
      resolveKhinsiderUrl: async (_url: string) =>
        "https://direct-server.com/resolved-audio.mp3",
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "SAVE" },
      utils,
    )(initialState);

    assertEquals(edge, "SAVE");
    assertEquals(state.urls[0], "https://example.com/audio.mp3");
    assertEquals(state.urls[1], "https://direct-server.com/resolved-audio.mp3");
  },
);

Deno.test(
  "resolveUrlsNode should handle empty URL list",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    const utils: Utils = {
      resolveKhinsiderUrl: async (_url: string) => "",
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "SAVE" },
      utils,
    )(initialState);

    assertEquals(edge, "SAVE");
    assertEquals(state.urls.length, 0);
  },
);

Deno.test(
  "resolveUrlsNode resolves only khinsider URLs in parallel",
  async () => {
    const initialState: State = {
      m3uFilePath: "/path/playlist.m3u",
      urls: [
        "https://downloads.khinsider.com/game-soundtracks/Alg/a.mp3",
        "https://downloads.khinsider.com/game-soundtracks/Alg/b.mp3",
        "https://example.com/c.mp3",
      ],
    };

    let resolveCalls = 0;
    const utils: Utils = {
      resolveKhinsiderUrl: async (_url: string) => {
        resolveCalls++;
        return `https://resolved.com/${_url.split("/").pop()}`;
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "SAVE" },
      utils,
    )(initialState);

    assertEquals(edge, "SAVE");
    assertEquals(state.urls[0], "https://resolved.com/a.mp3");
    assertEquals(state.urls[1], "https://resolved.com/b.mp3");
    assertEquals(state.urls[2], "https://example.com/c.mp3");
  },
);
