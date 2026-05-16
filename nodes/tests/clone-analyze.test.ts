import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-analyze.ts";

Deno.test("cloneAnalyzeNode should identify dependencies in the walk file", async () => {
  const initialState: State = {
    sourceWalk: "test-walk",
  };

  const walkContent = `
import { factory as startNode } from "../nodes/start.ts";
import { factory as nextNode } from "../nodes/next.ts";
import { someUtil } from "../utils/helper.ts";
  `;

  const nodeContent = `
import { otherUtil } from "../utils/other.ts";
  `;

  const utils: Utils = {
    readFile: async (path: string) => {
      if (path === "walks/test-walk.ts") return walkContent;
      if (path === "nodes/start.ts") return nodeContent;
      if (path === "nodes/next.ts") return "";
      return "";
    },
    exists: async (path: string) => {
      if (path === "specs/test-walk.md") return true;
      if (path === "nodes/start.ts") return true;
      if (path === "nodes/next.ts") return true;
      return false;
    },
  };

  const result = await factory(
    { onSuccess: "INIT", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(result[0], "INIT");
  const files = result[1].filesToCopy || [];
  assertEquals(files.includes("walks/test-walk.ts"), true);
  assertEquals(files.includes("specs/test-walk.md"), true);
  assertEquals(files.includes("nodes/start.ts"), true);
  assertEquals(files.includes("nodes/next.ts"), true);
  assertEquals(files.includes("utils/helper.ts"), true);
  assertEquals(files.includes("utils/other.ts"), true);
});
