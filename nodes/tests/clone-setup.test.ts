import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-setup.ts";

Deno.test("cloneSetupNode should return onSuccess and isNewProject=false when source walk exists and target is an Ambler project", async () => {
  const initialState: State = {
    sourceWalk: "counter",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "walks/counter.ts") return true;
      if (path === "/path/to/target/ambler.ts") return true;
      if (path === "/path/to/target/deno.json") return true;
      return false;
    },
  };

  const result = await factory(
    { onSuccess: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "ANALYZE");
  assertEquals(result[1].isNewProject, false);
});

Deno.test("cloneSetupNode should return onSuccess and isNewProject=true when target is NOT an Ambler project", async () => {
  const initialState: State = {
    sourceWalk: "counter",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async (path: string) => {
      if (path === "walks/counter.ts") return true;
      return false;
    },
  };

  const result = await factory(
    { onSuccess: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "ANALYZE");
  assertEquals(result[1].isNewProject, true);
});

Deno.test("cloneSetupNode should return onError when source walk does not exist", async () => {
  const initialState: State = {
    sourceWalk: "nonexistent",
    targetDir: "/path/to/target",
  };

  const utils: Utils = {
    exists: async () => false,
  };

  const result = await factory(
    { onSuccess: "ANALYZE", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "STOP");
  assertEquals(result[1].error, 'Source walk "nonexistent" not found at walks/nonexistent.ts.');
});

