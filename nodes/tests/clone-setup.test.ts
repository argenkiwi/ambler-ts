import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../clone-setup.ts";

test("cloneSetupNode should return onExisting and isNewProject=false when source walk exists and target is an Ambler project", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/walks/counter.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: (path: string) => {
      if (path === "../other/walks/counter.ts") return Promise.resolve(true);
      if (path === "/path/to/target/ambler.ts") return Promise.resolve(true);
      if (path === "/path/to/target/package.json") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("ANALYZE");
  expect(result[1].isNewProject).toEqual(false);
  expect(result[1].sourceRoot).toEqual("../other");
  expect(result[1].walkName).toEqual("counter");
});

test("cloneSetupNode should return onNewProject and isNewProject=true when target is NOT an Ambler project", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/walks/counter.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: (path: string) => {
      if (path === "../other/walks/counter.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("INIT_SETUP");
  expect(result[1].isNewProject).toEqual(true);
  expect(result[1].sourceRoot).toEqual("../other");
  expect(result[1].walkName).toEqual("counter");
});

test("cloneSetupNode should return onError when source walk does not exist", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/walks/nonexistent.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: () => Promise.resolve(false),
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  expect(result[1].error).toEqual(
    'Source walk not found at "../other/walks/nonexistent.ts".',
  );
});

test("cloneSetupNode should derive sourceRoot as '.' for a local walk path", async () => {
  const initialState: State = {
    sourceWalkPath: "walks/counter.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: (path: string) => {
      if (path === "walks/counter.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[1].sourceRoot).toEqual(".");
  expect(result[1].walkName).toEqual("counter");
});

test("cloneSetupNode should detect artifactType 'node' for a nodes/ path", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/nodes/clone-setup.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: (path: string) => {
      if (path === "../other/nodes/clone-setup.ts") {
        return Promise.resolve(true);
      }
      if (path === "/path/to/target/ambler.ts") return Promise.resolve(true);
      if (path === "/path/to/target/package.json") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("ANALYZE");
  expect(result[1].artifactType).toEqual("node");
  expect(result[1].sourceRoot).toEqual("../other");
  expect(result[1].walkName).toEqual("clone-setup");
});

test("cloneSetupNode should detect artifactType 'util' for a utils/ path", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/utils/my-util.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: (path: string) => {
      if (path === "../other/utils/my-util.ts") return Promise.resolve(true);
      if (path === "/path/to/target/ambler.ts") return Promise.resolve(true);
      if (path === "/path/to/target/package.json") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("ANALYZE");
  expect(result[1].artifactType).toEqual("util");
  expect(result[1].sourceRoot).toEqual("../other");
  expect(result[1].walkName).toEqual("my-util");
});
