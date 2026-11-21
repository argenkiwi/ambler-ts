import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../init-setup.ts";

/** Mimics the ENOENT error node:fs rejects with for a missing path. */
const notFound = (path = "") =>
  Object.assign(new Error(`ENOENT: no such file or directory, ${path}`), {
    code: "ENOENT",
  });

test("initSetupNode should transition to onSuccess when targetDir is valid", async () => {
  const initialState: State = { targetDir: "new-project" };
  const createdDirs: string[] = [];

  const utils: Utils = {
    mkdir: (path: string) => {
      createdDirs.push(path);
      return Promise.resolve();
    },
    stat: () => Promise.reject(notFound()),
  };

  const [edge, state] = await factory(
    { onSuccess: "COPY", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("COPY");
  expect(createdDirs.length).toEqual(5);
  expect(state.error).toBeUndefined();
});

test("initSetupNode should transition to onError when targetDir is missing", async () => {
  const initialState: State = { targetDir: "" };

  const utils: Utils = {
    mkdir: () => Promise.resolve(),
    stat: () => Promise.reject(notFound()),
  };

  const [edge, state] = await factory(
    { onSuccess: "COPY", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("STOP");
  expect(state.error).toEqual("No target directory provided.");
});

test("initSetupNode should transition to onError when targetDir is not a directory", async () => {
  const initialState: State = { targetDir: "file.txt" };

  const utils: Utils = {
    mkdir: () => Promise.resolve(),
    stat: () =>
      Promise.resolve({
        isDirectory: false,
      }),
  };

  const [edge, state] = await factory(
    { onSuccess: "COPY", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("STOP");
  expect(state.error).toEqual('"file.txt" exists and is not a directory.');
});

test("initSetupNode should transition to onError when mkdir fails", async () => {
  const initialState: State = { targetDir: "new-project" };

  const utils: Utils = {
    mkdir: () => Promise.reject(new Error("Permission denied")),
    stat: () => Promise.reject(notFound()),
  };

  const [edge, state] = await factory(
    { onSuccess: "COPY", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("STOP");
  expect(state.error).toEqual(
    "Failed to create directories: Permission denied",
  );
});
