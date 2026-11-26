import { expect, test } from "bun:test";
import { factory } from "../scaffold-node.ts";
import { fakeFs } from "./fake-fs.ts";

const edges = { onDone: "DONE", onError: "ERROR" };
const run = (fs: ReturnType<typeof fakeFs>, argv: string[]) =>
  factory(edges, fs.utils)({ argv, exitCode: 0 });

test("scaffoldNode writes node and test with edges and state from flags", async () => {
  const fs = fakeFs();
  const [next] = await run(fs, [
    "fooBar",
    "--outcomes",
    "success,onFail",
    "--state",
    "count:number",
  ]);
  expect(next).toBe("DONE");
  const node = fs.files.get("nodes/foo-bar.ts") ?? "";
  expect(node).toContain('export type Edge = "onSuccess" | "onFail";');
  expect(node).toContain("count: number;");
  expect(fs.files.has("nodes/tests/foo-bar.test.ts")).toBe(true);
  expect(fs.formatted).toEqual([
    "nodes/foo-bar.ts",
    "nodes/tests/foo-bar.test.ts",
  ]);
  expect(fs.out).toEqual([
    "Created nodes/foo-bar.ts",
    "Created nodes/tests/foo-bar.test.ts",
  ]);
});

test("scaffoldNode --terminal gives a single onDone edge", async () => {
  const fs = fakeFs();
  await run(fs, ["end", "--terminal"]);
  expect(fs.files.get("nodes/end.ts")).toContain(
    'export type Edge = "onDone";',
  );
});

test("scaffoldNode requires a name, then outcomes or terminal (exit code 2)", async () => {
  for (const argv of [[], ["x"]]) {
    const fs = fakeFs();
    const [next, state] = await run(fs, argv);
    expect(next).toBe("ERROR");
    expect(state.exitCode).toBe(2);
    expect(fs.files.size).toBe(0);
  }
});

test("scaffoldNode refuses to overwrite an existing node (exit code 1)", async () => {
  const fs = fakeFs({ "nodes/x.ts": "old" });
  const [next, state] = await run(fs, ["x", "--terminal"]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(1);
  expect(fs.files.get("nodes/x.ts")).toBe("old");
});

const startNode = `import type { NodeFactory } from "../ambler.ts";
import type { Board } from "../utils/game.ts";

export interface State {
  // Remaining health; 0 ends the game.
  playerHealth: number;
  board: Board;
  winner?: "player" | "cpu";
  scores: {
    player: number;
    cpu: number;
  };
}

export type Edge = "onReady" | "onError";
`;

test("scaffoldNode reuses the type another node gives a field", async () => {
  const fs = fakeFs({
    "nodes/kps-start.ts": startNode,
    "utils/game.ts": "export type Board = string[][];\n",
  });
  const [next] = await run(fs, [
    "kps-result",
    "--outcomes",
    "continue",
    "--state",
    "player_health",
    "--state",
    "board",
    "--state",
    "winner",
    "--state",
    "scores",
  ]);
  expect(next).toBe("DONE");
  const node = fs.files.get("nodes/kps-result.ts") ?? "";
  expect(node).toContain("playerHealth: number;");
  expect(node).toContain("board: Board;");
  expect(node).toContain('winner?: "player" | "cpu";');
  expect(node).toContain("scores: { player: number; cpu: number };");
  expect(node).toContain('import type { Board } from "../utils/game.ts";');
  const testFile = fs.files.get("nodes/tests/kps-result.test.ts") ?? "";
  expect(testFile).toContain("playerHealth: 0,");
  expect(testFile).toContain("board: {} as Board,");
  expect(testFile).not.toContain("winner");
  expect(testFile).toContain(
    'import type { Board } from "../../utils/game.ts";',
  );
  expect(fs.errors).toEqual([]);
});

test("scaffoldNode keeps everything after the first colon as the type", async () => {
  const fs = fakeFs();
  await run(fs, ["x", "--terminal", "--state", "m:Record<string, number>"]);
  expect(fs.files.get("nodes/x.ts")).toContain("m: Record<string, number>;");
});

test("scaffoldNode imports a named type from the node that exports it", async () => {
  const fs = fakeFs({
    "nodes/a.ts": "export interface Move {\n  x: number;\n}\n",
  });
  await run(fs, ["b", "--terminal", "--state", "move:Move | null"]);
  expect(fs.files.get("nodes/b.ts")).toContain(
    'import type { Move } from "./a.ts";',
  );
  expect(fs.files.get("nodes/tests/b.test.ts")).toContain("move: null,");
});

test("scaffoldNode warns about a type no file exports", async () => {
  const fs = fakeFs();
  const [next] = await run(fs, ["b", "--terminal", "--state", "board:Board"]);
  expect(next).toBe("DONE");
  expect(fs.errors).toEqual([
    "Warning: no file in nodes/ or utils/ exports the type Board; declare or import it in nodes/b.ts",
  ]);
});

test("scaffoldNode fails when no node gives an untyped field (exit code 2)", async () => {
  const fs = fakeFs();
  const [next, state] = await run(fs, ["b", "--terminal", "--state", "hp"]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
  expect(fs.errors[0]).toContain("--state hp:<Type>");
  expect(fs.files.size).toBe(0);
});

test("scaffoldNode fails when nodes disagree on a field's type (exit code 2)", async () => {
  const fs = fakeFs({
    "nodes/a.ts": "export interface State {\n  hp: number;\n}\n",
    "nodes/b.ts": "export interface State {\n  hp: string;\n}\n",
  });
  const [next, state] = await run(fs, ["c", "--terminal", "--state", "hp"]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
  expect(fs.errors[0]).toContain("nodes/a.ts: number, nodes/b.ts: string");
});
