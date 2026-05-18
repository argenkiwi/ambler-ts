import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-copy.ts";

Deno.test("cloneCopyNode should copy all files in filesToCopy list", async () => {
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

  assertEquals(result[0], "STOP");
  assertEquals(
    filesCopied.includes("/source/walks/my.ts->/target/walks/my.ts"),
    true,
  );
  assertEquals(
    filesCopied.includes("/source/nodes/node.ts->/target/nodes/node.ts"),
    true,
  );
  assertEquals(dirsCreated.includes("/target/walks"), true);
  assertEquals(dirsCreated.includes("/target/nodes"), true);
});
