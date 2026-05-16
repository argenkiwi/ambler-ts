import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../checkM3UFile.ts";

Deno.test(
  "checkM3UFileNode should transition to onSuccess when file path is valid",
  async () => {
    const initialState: State = { m3uFilePath: "", urls: [] };

    const utils: Utils = {
      args: () => ["/path/to/playlist.m3u"],
      stat: async (_path: string) => ({ isFile: true } as Deno.FileInfo),
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, "NEXT");
    assertEquals(state.m3uFilePath, "/path/to/playlist.m3u");
  },
);

Deno.test(
  "checkM3UFileNode should terminate when no file path is provided",
  async () => {
    const initialState: State = { m3uFilePath: "", urls: [] };

    const utils: Utils = {
      args: () => [],
      stat: async (_path: string) => {
        throw new Error("not called");
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge, state] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, null);
    assertEquals(state.m3uFilePath, "");
  },
);

Deno.test(
  "checkM3UFileNode should terminate when file extension is not .m3u",
  async () => {
    const initialState: State = { m3uFilePath: "", urls: [] };

    const utils: Utils = {
      args: () => ["/path/to/playlist.txt"],
      stat: async (_path: string) => {
        throw new Error("not called");
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, null);
  },
);

Deno.test(
  "checkM3UFileNode should terminate when file is not found",
  async () => {
    const initialState: State = { m3uFilePath: "/nonexistent.m3u", urls: [] };

    const utils: Utils = {
      args: () => ["/nonexistent.m3u"],
      stat: async (_path: string) => {
        throw new Error("File not found");
      },
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, null);
  },
);

Deno.test(
  "checkM3UFileNode should terminate when path is not a file",
  async () => {
    const initialState: State = { m3uFilePath: "/some-dir.m3u", urls: [] };

    const utils: Utils = {
      args: () => ["/some-dir.m3u"],
      stat: async (_path: string) => ({ isFile: false } as Deno.FileInfo),
      print: (msg: string) => console.log(msg),
    };

    const [edge] = await factory(
      { onSuccess: "NEXT" },
      utils,
    )(initialState);

    assertEquals(edge, null);
  },
);
