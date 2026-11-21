import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../clone-config.ts";

function makeUtils(
  targetContent: string,
  sourceContent = "",
): Utils & { written: Record<string, string> } {
  const written: Record<string, string> = {};
  return {
    written,
    readTextFile: (path: string) => {
      if (path.includes("/package.json") && !path.startsWith("/source")) {
        return Promise.resolve(targetContent);
      }
      if (path.startsWith("/source")) return Promise.resolve(sourceContent);
      throw new Error(`Unexpected read: ${path}`);
    },
    writeTextFile: (path: string, data: string) => {
      written[path] = data;
      return Promise.resolve();
    },
  };
}

test("cloneConfigNode adds walk script with default command when source has no script entry", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-walk",
    artifactType: "walk",
  };

  const utils = makeUtils(
    JSON.stringify({ dependencies: { zod: "^4.0.0" } }),
    JSON.stringify({}),
  );

  const result = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  const written = JSON.parse(utils.written["/target/package.json"]);
  expect(written.scripts["my-walk"]).toEqual("bun walks/my-walk.ts");
  expect(written.dependencies.zod).toEqual("^4.0.0");
});

test("cloneConfigNode copies script from source package.json when present", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-walk",
    artifactType: "walk",
  };

  const utils = makeUtils(
    JSON.stringify({}),
    JSON.stringify({ scripts: { "my-walk": "bun --watch walks/my-walk.ts" } }),
  );

  const result = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  const written = JSON.parse(utils.written["/target/package.json"]);
  expect(written.scripts["my-walk"]).toEqual("bun --watch walks/my-walk.ts");
});

test("cloneConfigNode adds external deps when externalDeps is populated", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-util",
    artifactType: "util",
    externalDeps: { ollama: "^0.6.4" },
  };

  const utils = makeUtils(JSON.stringify({ dependencies: { zod: "^4.0.0" } }));

  const result = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  const written = JSON.parse(utils.written["/target/package.json"]);
  expect(written.dependencies.ollama).toEqual("^0.6.4");
  expect(written.dependencies.zod).toEqual("^4.0.0");
  expect(written.scripts).toBeUndefined();
});

test("cloneConfigNode skips script creation for artifactType node", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-node",
    artifactType: "node",
    externalDeps: {},
  };

  const utils = makeUtils(JSON.stringify({}));

  const result = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  expect(utils.written["/target/package.json"]).toBeUndefined();
});

test("cloneConfigNode is a no-op when artifactType is node with no external deps", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "plain-node",
    artifactType: "node",
  };

  const utils = makeUtils(
    JSON.stringify({ scripts: { existing: "bun walks/existing.ts" } }),
  );

  const result = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("STOP");
  expect(utils.written["/target/package.json"]).toBeUndefined();
});
