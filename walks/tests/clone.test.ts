import { assertEquals } from "@std/assert";
import { walk } from "../../ambler.ts";
import { createWalk, initialState } from "../clone.ts";

/** An in-memory file system shared by every node's utils. */
function memoryFs(seed: Record<string, string>) {
  const files = new Map(Object.entries(seed));
  const printed: string[] = [];
  const read = (path: string) =>
    files.has(path)
      ? Promise.resolve(files.get(path)!)
      : Promise.reject(new Deno.errors.NotFound(path));
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
        stat: () => Promise.reject(new Deno.errors.NotFound()),
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
  "src/deno.json": JSON.stringify({
    tasks: { counter: "deno run walks/counter.ts" },
  }),
  "src/walks/counter.ts":
    'import defer * as startNode from "../nodes/start.ts";\n',
  "src/nodes/start.ts": "// start node",
  "src/specs/counter.md": "# spec",
};

Deno.test("clone copies a walk with its spec and nodes into an existing project and registers its task", async () => {
  const fs = memoryFs({
    ...source,
    "dst/ambler.ts": "// engine",
    "dst/deno.json": "{}",
  });

  const final = await walk(
    createWalk(fs.utils),
    "SETUP",
    initialState("src/walks/counter.ts", "dst"),
  );

  assertEquals(final.error, undefined);
  assertEquals(final.filesToCopy, [
    "walks/counter.ts",
    "specs/counter.md",
    "nodes/start.ts",
  ]);
  assertEquals(fs.files.get("dst/nodes/start.ts"), "// start node");
  assertEquals(
    JSON.parse(fs.files.get("dst/deno.json")!).tasks.counter,
    "deno run walks/counter.ts",
  );
  assertEquals(
    fs.printed[0],
    'Successfully cloned walk "counter" to "dst".',
  );
});

Deno.test("clone initialises the target first when it is not an Ambler project", async () => {
  const fs = memoryFs(source);

  const final = await walk(
    createWalk(fs.utils),
    "SETUP",
    initialState("src/walks/counter.ts", "dst"),
  );

  assertEquals(final.error, undefined);
  assertEquals(final.isNewProject, true);
  assertEquals(fs.files.get("dst/ambler.ts"), "// engine");
  assertEquals(
    fs.files.get("dst/walks/counter.ts"),
    source["src/walks/counter.ts"],
  );
});

Deno.test("clone stops with an error when the source does not exist", async () => {
  const fs = memoryFs({});

  const final = await walk(
    createWalk(fs.utils),
    "SETUP",
    initialState("src/walks/missing.ts", "dst"),
  );

  assertEquals(final.error, 'Source walk not found at "src/walks/missing.ts".');
  assertEquals(fs.printed, [
    'Error: Source walk not found at "src/walks/missing.ts".',
  ]);
});
