import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../init-copy.ts";

test("initCopyNode should transition to onSuccess when copyFile succeeds", async () => {
  const initialState: State = { targetDir: "new-project" };
  let copiedFrom = "";
  let copiedTo = "";

  const utils: Utils = {
    copyFile: (from: string, to: string) => {
      copiedFrom = from;
      copiedTo = to;
      return Promise.resolve();
    },
    getAmblerSrc: () => "/source/ambler.ts",
  };

  const [edge, state] = await factory(
    { onSuccess: "CONFIG", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("CONFIG");
  expect(copiedFrom).toEqual("/source/ambler.ts");
  expect(copiedTo).toEqual("new-project/ambler.ts");
  expect(state.error).toBeUndefined();
});

test("initCopyNode should transition to onError when copyFile fails", async () => {
  const initialState: State = { targetDir: "new-project" };

  const utils: Utils = {
    copyFile: () => Promise.reject(new Error("Disk full")),
    getAmblerSrc: () => "/source/ambler.ts",
  };

  const [edge, state] = await factory(
    { onSuccess: "CONFIG", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("STOP");
  expect(state.error).toEqual("Failed to copy ambler.ts: Disk full");
});
