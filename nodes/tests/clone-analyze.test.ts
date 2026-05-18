import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-analyze.ts";

Deno.test("cloneAnalyzeNode should identify dependencies in the walk file (artifactType walk)", async () => {
  const initialState: State = {
    sourceRoot: "../other",
    walkName: "test-walk",
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
    readFile: (path: string) => {
      if (path === "../other/walks/test-walk.ts") {
        return Promise.resolve(walkContent);
      }
      if (path === "../other/nodes/start.ts") {
        return Promise.resolve(nodeContent);
      }
      if (path === "../other/nodes/next.ts") return Promise.resolve("");
      return Promise.resolve("");
    },
    exists: (path: string) => {
      if (path === "../other/specs/test-walk.md") return Promise.resolve(true);
      if (path === "../other/nodes/start.ts") return Promise.resolve(true);
      if (path === "../other/nodes/next.ts") return Promise.resolve(true);
      if (path === "../other/utils/helper.ts") return Promise.resolve(true);
      if (path === "../other/utils/other.ts") return Promise.resolve(true);
      return Promise.resolve(false);
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

Deno.test("cloneAnalyzeNode should copy only the node and its utils for artifactType node", async () => {
  const initialState = {
    sourceRoot: "../other",
    walkName: "my-node",
    artifactType: "node" as const,
  };

  const nodeContent = `
import { someUtil } from "../utils/helper.ts";
  `;

  const utils = {
    readFile: (path: string) => {
      if (path === "../other/nodes/my-node.ts") {
        return Promise.resolve(nodeContent);
      }
      if (path === "../other/deno.json") {
        return Promise.resolve(JSON.stringify({}));
      }
      return Promise.resolve("");
    },
    exists: (path: string) => {
      if (path === "../other/nodes/my-node.ts") return Promise.resolve(true);
      if (path === "../other/utils/helper.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory({ onSuccess: "DONE", onError: "STOP" }, utils)(
    initialState,
  );

  assertEquals(result[0], "DONE");
  const files = result[1].filesToCopy ?? [];
  assertEquals(files.includes("nodes/my-node.ts"), true);
  assertEquals(files.includes("utils/helper.ts"), true);
  assertEquals(files.includes("walks/my-node.ts"), false);
});

Deno.test("cloneAnalyzeNode should copy only the util file for artifactType util", async () => {
  const initialState = {
    sourceRoot: "../other",
    walkName: "my-util",
    artifactType: "util" as const,
  };

  const utils = {
    readFile: (path: string) => {
      if (path === "../other/deno.json") {
        return Promise.resolve(JSON.stringify({}));
      }
      return Promise.resolve("");
    },
    exists: (path: string) => {
      if (path === "../other/utils/my-util.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory({ onSuccess: "DONE", onError: "STOP" }, utils)(
    initialState,
  );

  assertEquals(result[0], "DONE");
  const files = result[1].filesToCopy ?? [];
  assertEquals(files, ["utils/my-util.ts"]);
});

Deno.test("cloneAnalyzeNode should collect externalDeps from utils that import bare specifiers", async () => {
  const initialState = {
    sourceRoot: "../other",
    walkName: "my-util",
    artifactType: "util" as const,
  };

  const utilContent = `
import { Ollama } from "ollama";
import { assertEquals } from "@std/assert";
import { relative } from "./local.ts";
  `;

  const utils = {
    readFile: (path: string) => {
      if (path === "../other/utils/my-util.ts") {
        return Promise.resolve(utilContent);
      }
      if (path === "../other/deno.json") {
        return Promise.resolve(JSON.stringify({
          imports: {
            "ollama": "npm:ollama@^0.6.3",
            "@std/assert": "jsr:@std/assert@^1.0.19",
          },
        }));
      }
      return Promise.resolve("");
    },
    exists: (path: string) => {
      if (path === "../other/utils/my-util.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory({ onSuccess: "DONE", onError: "STOP" }, utils)(
    initialState,
  );

  assertEquals(result[0], "DONE");
  const deps = result[1].externalDeps ?? {};
  assertEquals(deps["ollama"], "npm:ollama@^0.6.3");
  assertEquals(deps["@std/assert"], "jsr:@std/assert@^1.0.19");
  assertEquals(deps["./local.ts"], undefined);
});
