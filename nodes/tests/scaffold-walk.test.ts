import { expect, test } from "bun:test";
import { factory } from "../scaffold-walk.ts";
import { fakeFs } from "./fake-fs.ts";

const edges = { onDone: "DONE", onError: "ERROR" };
const run = (fs: ReturnType<typeof fakeFs>, argv: string[]) =>
  factory(edges, fs.utils)({ argv, exitCode: 0 });

const node = (state: string, edgeUnion: string) =>
  `export interface State {\n${state}}\n\nexport type Edge = ${edgeUnion};\n`;

const PACKAGE = `{
  "name": "demo",
  "scripts": {
    "test": "bun test",
    "check": "tsc --noEmit",
    "lint": "biome check"
  }
}
`;

/** A project with three nodes: start → count ⟲ / stop. */
function project(extra: Record<string, string> = {}) {
  return fakeFs({
    "package.json": PACKAGE,
    "nodes/start.ts": node("  count: number;\n", '"onSuccess" | "onError"'),
    "nodes/count.ts": node(
      "  count: number;\n  board: Board;\n  note?: string;\n",
      '"onCount" | "onStop"',
    ),
    "nodes/stop.ts": node("  count: number;\n", '"onDone"'),
    "utils/game.ts": "export type Board = string[][];\n",
    ...extra,
  });
}

test("scaffoldWalk merges State, wires every edge and adds the runner script", async () => {
  const fs = project();
  const [next, state] = await run(fs, [
    "demo",
    "--nodes",
    "start,count,stop",
    "--edge",
    "start.success=count,count.stop=stop",
  ]);
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(0);
  const walk = fs.files.get("walks/demo.ts") ?? "";
  expect(walk).toContain(
    "export interface State {\n  count: number;\n  board: Board;\n  note?: string;\n}",
  );
  expect(walk).toContain('import type { Board } from "../utils/game.ts";');
  expect(walk).toContain(
    'START: () => startNode.factory({ onSuccess: "COUNT", onError: unwired("START.onError") }',
  );
  expect(walk).toContain(
    'COUNT: () => countNode.factory({ onCount: unwired("COUNT.onCount"), onStop: "STOP" }',
  );
  expect(walk).toContain("STOP: () => stopNode.factory({ onDone: null }");
  expect(walk).toContain("function unwired(edge: string): never {");
  expect(walk).toContain(
    'await walk(createWalk(), "START", { count: 0, board: {} as Board });',
  );
  expect(fs.files.get("package.json")).toContain(
    '"lint": "biome check",\n    "demo": "bun walks/demo.ts"\n  }',
  );
  expect(fs.out).toEqual([
    "Created walks/demo.ts",
    "Created walks/tests/demo.test.ts",
    "Created specs/demo.md",
    "Added the demo script to package.json",
  ]);
  expect(fs.errors).toEqual([]);
});

test("scaffoldWalk takes repeated --edge flags and halt", async () => {
  const fs = project();
  await run(fs, [
    "demo",
    "--nodes",
    "start,stop",
    "--edge",
    "start.onSuccess=stop",
    "--edge",
    "start.error=halt",
  ]);
  const walk = fs.files.get("walks/demo.ts") ?? "";
  expect(walk).toContain(
    'START: () => startNode.factory({ onSuccess: "STOP", onError: null }',
  );
  expect(walk).not.toContain("unwired");
});

test("scaffoldWalk keeps an existing spec and says so", async () => {
  const fs = project({ "specs/demo.md": "mine" });
  await run(fs, ["demo", "--nodes", "stop"]);
  expect(fs.files.get("specs/demo.md")).toBe("mine");
  expect(fs.out).toContain("Kept specs/demo.md");
  expect(fs.out).not.toContain("Created specs/demo.md");
});

test("scaffoldWalk --no-runner leaves package.json alone", async () => {
  const fs = project();
  await run(fs, ["demo", "--nodes", "stop", "--no-runner"]);
  expect(fs.files.get("package.json")).toBe(PACKAGE);
});

test("scaffoldWalk keeps an existing runner script", async () => {
  const fs = project();
  await run(fs, ["demo", "--nodes", "stop"]);
  const once = fs.files.get("package.json");
  fs.files.delete("walks/demo.ts");
  await run(fs, ["demo", "--nodes", "stop"]);
  expect(fs.files.get("package.json")).toBe(once);
  expect(fs.out).toContain("Kept the demo script in package.json");
});

test("scaffoldWalk lists the node commands to run for missing nodes (exit code 2)", async () => {
  const fs = project();
  const [next, state] = await run(fs, [
    "demo",
    "--nodes",
    "start,read_move,judge",
    "--edge",
    "read_move.valid=judge,read_move.invalid_input=read_move",
  ]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
  expect(fs.errors).toEqual([
    [
      "Error: no node at nodes/read-move.ts, nodes/judge.ts. Create them first:",
      "  ambler node read-move --outcomes valid,invalid_input",
      "  ambler node judge (--outcomes <a,b> | --terminal)",
    ].join("\n"),
  ]);
  expect(fs.files.has("walks/demo.ts")).toBe(false);
});

test("scaffoldWalk rejects bad --edge flags (exit code 2)", async () => {
  for (const [edge, error] of [
    ["start", "is not <node>.<outcome>=<node|halt>"],
    ["start.nope=stop", "start has no edge onNope"],
    ["start.success=elsewhere", "which is not in --nodes"],
    ["count.stop=stop", "count, which is not in --nodes"],
  ]) {
    const fs = project();
    const [next, state] = await run(fs, [
      "demo",
      "--nodes",
      "start,stop",
      "--edge",
      edge,
    ]);
    expect(next).toBe("ERROR");
    expect(state.exitCode).toBe(2);
    expect(fs.errors[0]).toContain(error);
  }
});

test("scaffoldWalk fails when nodes give a field different types (exit code 2)", async () => {
  const fs = project({
    "nodes/other.ts": node("  count: string;\n", '"onDone"'),
  });
  const [next, state] = await run(fs, ["demo", "--nodes", "start,other"]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
  expect(fs.errors).toEqual([
    'Error: nodes give "count" different types (nodes/start.ts: number, nodes/other.ts: string)',
  ]);
});

test("scaffoldWalk requires a name and --nodes (exit code 2)", async () => {
  for (const argv of [[], ["demo"]]) {
    const [next, state] = await run(fakeFs(), argv);
    expect(next).toBe("ERROR");
    expect(state.exitCode).toBe(2);
  }
});

test("scaffoldWalk refuses to overwrite an existing walk (exit code 1)", async () => {
  const fs = fakeFs({ "walks/demo.ts": "old" });
  const [next, state] = await run(fs, ["demo", "--nodes", "a"]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(1);
});
