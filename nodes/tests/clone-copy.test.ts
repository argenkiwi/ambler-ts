import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../clone-copy.ts";

test("cloneCopyNode should copy all files in filesToCopy list", async () => {
  const initialState: State = {
    sourceRoot: "/source",
    targetDir: "/target",
    filesToCopy: ["walks/my.ts", "nodes/node.ts"],
  };

  const filesCopied: string[] = [];
  const dirsCreated: string[] = [];

  const utils: Utils = {
    copyFile: (src, dest) => {
      filesCopied.push(`${src}->${dest}`);
      return Promise.resolve();
    },
    mkdir: (path) => {
      dirsCreated.push(path);
      return Promise.resolve();
    },
  };

  const result = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  expect(
    filesCopied.includes("/source/walks/my.ts->/target/walks/my.ts"),
  ).toEqual(true);
  expect(
    filesCopied.includes("/source/nodes/node.ts->/target/nodes/node.ts"),
  ).toEqual(true);
  expect(dirsCreated.includes("/target/walks")).toEqual(true);
  expect(dirsCreated.includes("/target/nodes")).toEqual(true);
});
