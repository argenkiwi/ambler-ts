import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-setup.ts";

Deno.test("cloneSetupNode should return onExisting and isNewProject=false when source walk exists and target is an Ambler project", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/walks/counter.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "../other/walks/counter.ts") return true;
      if (path === "/path/to/target/ambler.ts") return true;
      if (path === "/path/to/target/deno.json") return true;
      return false;
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "ANALYZE");
  assertEquals(result[1].isNewProject, false);
  assertEquals(result[1].sourceRoot, "../other");
  assertEquals(result[1].walkName, "counter");
});

Deno.test("cloneSetupNode should return onNewProject and isNewProject=true when target is NOT an Ambler project", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/walks/counter.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "../other/walks/counter.ts") return true;
      return false;
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "INIT_SETUP");
  assertEquals(result[1].isNewProject, true);
  assertEquals(result[1].sourceRoot, "../other");
  assertEquals(result[1].walkName, "counter");
});

Deno.test("cloneSetupNode should return onError when source walk does not exist", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/walks/nonexistent.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async () => false,
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "STOP");
  assertEquals(
    result[1].error,
    'Source walk not found at "../other/walks/nonexistent.ts".',
  );
});

Deno.test("cloneSetupNode should derive sourceRoot as '.' for a local walk path", async () => {
  const initialState: State = {
    sourceWalkPath: "walks/counter.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "walks/counter.ts") return true;
      return false;
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[1].sourceRoot, ".");
  assertEquals(result[1].walkName, "counter");
});

Deno.test("cloneSetupNode should detect artifactType 'node' for a nodes/ path", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/nodes/clone-setup.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "../other/nodes/clone-setup.ts") return true;
      if (path === "/path/to/target/ambler.ts") return true;
      if (path === "/path/to/target/deno.json") return true;
      return false;
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "ANALYZE");
  assertEquals(result[1].artifactType, "node");
  assertEquals(result[1].sourceRoot, "../other");
  assertEquals(result[1].walkName, "clone-setup");
});

Deno.test("cloneSetupNode should detect artifactType 'util' for a utils/ path", async () => {
  const initialState: State = {
    sourceWalkPath: "../other/utils/my-util.ts",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "../other/utils/my-util.ts") return true;
      if (path === "/path/to/target/ambler.ts") return true;
      if (path === "/path/to/target/deno.json") return true;
      return false;
    },
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "ANALYZE");
  assertEquals(result[1].artifactType, "util");
  assertEquals(result[1].sourceRoot, "../other");
  assertEquals(result[1].walkName, "my-util");
});
