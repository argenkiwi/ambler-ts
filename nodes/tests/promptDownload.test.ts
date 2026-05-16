import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../promptDownload.ts";

Deno.test(
  "promptDownloadNode should transition to onYes when user enters y",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "y",
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onYes: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, "DOWNLOAD");
    assertEquals(state.m3uFilePath, "/path/playlist.m3u");
  },
);

Deno.test(
  "promptDownloadNode should transition to onYes when user enters yes",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "yes",
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onYes: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, "DOWNLOAD");
  },
);

Deno.test(
  "promptDownloadNode should terminate when user enters n",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "n",
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onYes: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, null);
  },
);

Deno.test(
  "promptDownloadNode should terminate when user enters no",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    const utils: Utils = {
      readLine: (_msg: string) => "no",
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onYes: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, null);
  },
);

Deno.test(
  "promptDownloadNode should loop until valid input is provided",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    let callCount = 0;
    const utils: Utils = {
      readLine: (_msg: string) => {
        callCount++;
        if (callCount === 1) return "invalid";
        return "yes";
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onYes: "DOWNLOAD" },
      utils,
    )(initialState);

    assertEquals(edge, "DOWNLOAD");
    assertEquals(callCount, 2);
  },
);
