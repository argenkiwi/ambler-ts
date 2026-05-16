import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../saveM3UFile.ts";

Deno.test(
  "saveM3UFileNode should write joined URLs to file and transition to onSuccess",
  async () => {
    const initialState: State = {
      m3uFilePath: "/path/playlist.m3u",
      urls: ["https://example.com/a.mp3", "https://example.com/b.mp3"],
    };

    let fileContent = "";
    const utils: Utils = {
      writeFile: (path: string, content: string) => {
        assertEquals(path, "/path/playlist.m3u");
        fileContent = content;
        return Promise.resolve();
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, "NEXT");
    assertEquals(
      fileContent,
      "https://example.com/a.mp3\nhttps://example.com/b.mp3",
    );
    assertEquals(state.urls, [
      "https://example.com/a.mp3",
      "https://example.com/b.mp3",
    ]);
  },
);

Deno.test(
  "saveM3UFileNode should handle empty URL list",
  async () => {
    const initialState: State = { m3uFilePath: "/path/playlist.m3u", urls: [] };

    let fileContent = "";
    const utils: Utils = {
      writeFile: (path: string, content: string) => {
        fileContent = content;
        return Promise.resolve();
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, "NEXT");
    assertEquals(fileContent, "");
  },
);
