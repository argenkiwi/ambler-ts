import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../clone-analyze.ts";

test("cloneAnalyzeNode should identify dependencies in the walk file (artifactType walk)", async () => {
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

  expect(result[0]).toEqual("INIT");
  const files = result[1].filesToCopy || [];
  expect(files.includes("walks/test-walk.ts")).toEqual(true);
  expect(files.includes("specs/test-walk.md")).toEqual(true);
  expect(files.includes("nodes/start.ts")).toEqual(true);
  expect(files.includes("nodes/next.ts")).toEqual(true);
  expect(files.includes("utils/helper.ts")).toEqual(true);
  expect(files.includes("utils/other.ts")).toEqual(true);
});

test("cloneAnalyzeNode should copy only the node and its utils for artifactType node", async () => {
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
      if (path === "../other/package.json") {
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

  const result = await factory(
    { onSuccess: "DONE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("DONE");
  const files = result[1].filesToCopy ?? [];
  expect(files.includes("nodes/my-node.ts")).toEqual(true);
  expect(files.includes("utils/helper.ts")).toEqual(true);
  expect(files.includes("walks/my-node.ts")).toEqual(false);
});

test("cloneAnalyzeNode should copy only the util file for artifactType util", async () => {
  const initialState = {
    sourceRoot: "../other",
    walkName: "my-util",
    artifactType: "util" as const,
  };

  const utils = {
    readFile: (path: string) => {
      if (path === "../other/package.json") {
        return Promise.resolve(JSON.stringify({}));
      }
      return Promise.resolve("");
    },
    exists: (path: string) => {
      if (path === "../other/utils/my-util.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onSuccess: "DONE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("DONE");
  const files = result[1].filesToCopy ?? [];
  expect(files).toEqual(["utils/my-util.ts"]);
});

test("cloneAnalyzeNode should collect externalDeps from utils that import bare specifiers", async () => {
  const initialState = {
    sourceRoot: "../other",
    walkName: "my-util",
    artifactType: "util" as const,
  };

  const utilContent = `
import { Ollama } from "ollama";
import { z } from "zod";
import { relative } from "./local.ts";
  `;

  const utils = {
    readFile: (path: string) => {
      if (path === "../other/utils/my-util.ts") {
        return Promise.resolve(utilContent);
      }
      if (path === "../other/package.json") {
        return Promise.resolve(
          JSON.stringify({
            dependencies: {
              ollama: "^0.6.4",
              zod: "^4.0.0",
            },
          }),
        );
      }
      return Promise.resolve("");
    },
    exists: (path: string) => {
      if (path === "../other/utils/my-util.ts") return Promise.resolve(true);
      return Promise.resolve(false);
    },
  };

  const result = await factory(
    { onSuccess: "DONE", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("DONE");
  const deps = result[1].externalDeps ?? {};
  expect(deps.ollama).toEqual("^0.6.4");
  expect(deps.zod).toEqual("^4.0.0");
  expect(deps["./local.ts"]).toBeUndefined();
});
