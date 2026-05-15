import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../init-setup.ts";

Deno.test("initSetupNode should transition to onSuccess when targetDir is valid", async () => {
  const initialState: State = { targetDir: "new-project" };
  const createdDirs: string[] = [];

  const utils: Utils = {
    mkdir: (path: string) => {
      createdDirs.push(path);
      return Promise.resolve();
    },
    stat: () => Promise.reject(new Deno.errors.NotFound()),
  };

  const [edge, state] = await factory(
    { onSuccess: "copy", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "copy");
  assertEquals(createdDirs.length, 5);
  assertEquals(state.error, undefined);
});

Deno.test("initSetupNode should transition to onError when targetDir is missing", async () => {
  const initialState: State = { targetDir: "" };

  const utils: Utils = {
    mkdir: () => Promise.resolve(),
    stat: () => Promise.reject(new Deno.errors.NotFound()),
  };

  const [edge, state] = await factory(
    { onSuccess: "copy", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "stop");
  assertEquals(state.error, "No target directory provided.");
});

Deno.test("initSetupNode should transition to onError when targetDir is not a directory", async () => {
  const initialState: State = { targetDir: "file.txt" };

  const utils: Utils = {
    mkdir: () => Promise.resolve(),
    stat: () =>
      Promise.resolve({
        isDirectory: false,
      } as Deno.FileInfo),
  };

  const [edge, state] = await factory(
    { onSuccess: "copy", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "stop");
  assertEquals(state.error, '"file.txt" exists and is not a directory.');
});

Deno.test("initSetupNode should transition to onError when mkdir fails", async () => {
  const initialState: State = { targetDir: "new-project" };

  const utils: Utils = {
    mkdir: () => Promise.reject(new Error("Permission denied")),
    stat: () => Promise.reject(new Deno.errors.NotFound()),
  };

  const [edge, state] = await factory(
    { onSuccess: "copy", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "stop");
  assertEquals(state.error, "Failed to create directories: Permission denied");
});
