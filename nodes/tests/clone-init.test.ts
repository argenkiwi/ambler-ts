import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-init.ts";

Deno.test("cloneInitNode should create directories and copy core files when isNewProject is true", async () => {
  const initialState: State = {
    targetDir: "/path/to/target",
    isNewProject: true,
  };

  const dirsCreated: string[] = [];
  const filesCopied: string[] = [];

  const utils: Utils = {
    mkdir: async (path: string) => {
      dirsCreated.push(path);
    },
    copyFile: async (src: string, dest: string) => {
      filesCopied.push(`${src}->${dest}`);
    },
  };

  const result = await factory(
    { onSuccess: "copy", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(result[0], "copy");
  assertEquals(dirsCreated.includes("/path/to/target/walks"), true);
  assertEquals(filesCopied.includes("ambler.ts->/path/to/target/ambler.ts"), true);
  assertEquals(filesCopied.includes("deno.json->/path/to/target/deno.json"), true);
});

Deno.test("cloneInitNode should skip initialization when isNewProject is false", async () => {
  const initialState: State = {
    targetDir: "/path/to/target",
    isNewProject: false,
  };

  const utils: Utils = {
    mkdir: async () => { throw new Error("Should not be called"); },
    copyFile: async () => { throw new Error("Should not be called"); },
  };

  const result = await factory(
    { onSuccess: "copy", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(result[0], "copy");
});
