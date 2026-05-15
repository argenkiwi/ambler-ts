import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-copy.ts";

Deno.test("cloneCopyNode should copy all files in filesToCopy list", async () => {
  const initialState: State = {
    targetDir: "/target",
    filesToCopy: ["walks/my.ts", "nodes/node.ts"],
  };

  const filesCopied: string[] = [];
  const dirsCreated: string[] = [];

  const utils: Utils = {
    copyFile: async (src, dest) => {
      filesCopied.push(`${src}->${dest}`);
    },
    mkdir: async (path) => {
      dirsCreated.push(path);
    },
  };

  const result = await factory(
    { onSuccess: "stop", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(result[0], "stop");
  assertEquals(filesCopied.includes("walks/my.ts->/target/walks/my.ts"), true);
  assertEquals(filesCopied.includes("nodes/node.ts->/target/nodes/node.ts"), true);
  assertEquals(dirsCreated.includes("/target/walks"), true);
  assertEquals(dirsCreated.includes("/target/nodes"), true);
});
