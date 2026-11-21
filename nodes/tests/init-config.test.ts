import { expect, test } from "bun:test";
import {
  factory,
  PROJECT_FILES,
  type State,
  type Utils,
} from "../init-config.ts";

test("initConfigNode writes package.json and tsconfig.json then transitions to onSuccess", async () => {
  const initialState: State = { targetDir: "new-project" };
  const written: Record<string, string> = {};

  const utils: Utils = {
    writeTextFile: (path: string, data: string) => {
      written[path] = data;
      return Promise.resolve();
    },
  };

  const [edge, state] = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("STOP");
  expect(Object.keys(written)).toEqual([
    "new-project/package.json",
    "new-project/tsconfig.json",
  ]);
  expect(JSON.parse(written["new-project/package.json"]).type).toEqual(
    "module",
  );
  expect(written["new-project/tsconfig.json"]).toEqual(
    PROJECT_FILES["tsconfig.json"],
  );
  expect(state.error).toBeUndefined();
});

test("initConfigNode transitions to onError naming the file that failed to write", async () => {
  const initialState: State = { targetDir: "new-project" };

  const utils: Utils = {
    writeTextFile: () => Promise.reject(new Error("Write error")),
  };

  const [edge, state] = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(edge).toEqual("STOP");
  expect(state.error).toEqual("Failed to write package.json: Write error");
});
