import { expect, test } from "bun:test";
import { walk } from "../../ambler.ts";
import { createWalk, initialState } from "../clone.ts";

/** Mimics the ENOENT error node:fs rejects with for a missing path. */
const notFound = (path = "") =>
  Object.assign(new Error(`ENOENT: no such file or directory, ${path}`), {
    code: "ENOENT",
  });

/** An in-memory file system shared by every node's utils. */
function memoryFs(seed: Record<string, string>) {
  const files = new Map(Object.entries(seed));
  const printed: string[] = [];
  const read = (path: string) =>
    files.has(path)
      ? Promise.resolve(files.get(path)!)
      : Promise.reject(notFound(path));
  const write = (path: string, data: string) => {
    files.set(path, data);
    return Promise.resolve();
  };
  const exists = (path: string) => Promise.resolve(files.has(path));
  const copyFile = async (src: string, dest: string) =>
    write(dest, await read(src));
  const mkdir = () => Promise.resolve();
  return {
    files,
    printed,
    utils: {
      setup: { exists },
      analyze: { readFile: read, exists },
      initSetup: {
        mkdir,
        stat: () => Promise.reject(notFound()),
      },
      initCopy: { copyFile, getAmblerSrc: () => "src/ambler.ts" },
      initConfig: { writeTextFile: write },
      copy: { copyFile, mkdir },
      config: { readTextFile: read, writeTextFile: write },
      stop: {
        print: (msg: string) => {
          printed.push(msg);
        },
      },
    },
  };
}

const source = {
  "src/ambler.ts": "// engine",
  "src/package.json": JSON.stringify({
    scripts: { counter: "bun walks/counter.ts" },
  }),
  "src/walks/counter.ts":
    'import defer * as startNode from "../nodes/start.ts";\n',
  "src/nodes/start.ts": "// start node",
  "src/specs/counter.md": "# spec",
};

test("clone copies a walk with its spec and nodes into an existing project and registers its task", async () => {
  const fs = memoryFs({
    ...source,
    "dst/ambler.ts": "// engine",
    "dst/package.json": "{}",
  });

  const final = await walk(
    createWalk(fs.utils),
    "SETUP",
    initialState("src/walks/counter.ts", "dst"),
  );

  expect(final.error).toBeUndefined();
  expect(final.filesToCopy).toEqual([
    "walks/counter.ts",
    "specs/counter.md",
    "nodes/start.ts",
  ]);
  expect(fs.files.get("dst/nodes/start.ts")).toEqual("// start node");
  expect(JSON.parse(fs.files.get("dst/package.json")!).scripts.counter).toEqual(
    "bun walks/counter.ts",
  );
  expect(fs.printed[0]).toEqual('Successfully cloned walk "counter" to "dst".');
});

test("clone initialises the target first when it is not an Ambler project", async () => {
  const fs = memoryFs(source);

  const final = await walk(
    createWalk(fs.utils),
    "SETUP",
    initialState("src/walks/counter.ts", "dst"),
  );

  expect(final.error).toBeUndefined();
  expect(final.isNewProject).toEqual(true);
  expect(fs.files.get("dst/ambler.ts")).toEqual("// engine");
  expect(fs.files.get("dst/walks/counter.ts")).toEqual(
    source["src/walks/counter.ts"],
  );
});

test("clone stops with an error when the source does not exist", async () => {
  const fs = memoryFs({});

  const final = await walk(
    createWalk(fs.utils),
    "SETUP",
    initialState("src/walks/missing.ts", "dst"),
  );

  expect(final.error).toEqual(
    'Source walk not found at "src/walks/missing.ts".',
  );
  expect(fs.printed).toEqual([
    'Error: Source walk not found at "src/walks/missing.ts".',
  ]);
});
