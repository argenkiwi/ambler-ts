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
  expect(node).toContain('import type { HasCount } from "./state.ts";');
  expect(node).toContain("export interface State extends HasCount {}");
  expect(fs.files.get("nodes/state.ts")).toBe(
    "export interface HasCount {\n  count: number;\n}\n",
  );
  expect(fs.files.get("nodes/tests/foo-bar.test.ts")).toContain("count: 0,");
  expect(fs.formatted).toEqual([
    "nodes/state.ts",
    "nodes/foo-bar.ts",
    "nodes/tests/foo-bar.test.ts",
  ]);
  expect(fs.out).toEqual([
    "Added HasCount to nodes/state.ts",
    "Created nodes/foo-bar.ts",
    "Created nodes/tests/foo-bar.test.ts",
  ]);
});

test("scaffoldNode without --state gives State = object", async () => {
  const fs = fakeFs();
  await run(fs, ["end", "--terminal"]);
  const node = fs.files.get("nodes/end.ts") ?? "";
  expect(node).toContain("export type State = object;");
  expect(node).not.toContain("biome-ignore");
  expect(fs.files.has("nodes/state.ts")).toBe(false);
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

const registry = `import type { Board } from "../utils/game.ts";

export interface HasPlayerHealth {
  // Remaining health; 0 ends the game.
  playerHealth: number;
}

export interface HasBoard {
  board: Board;
}

export interface HasWinner {
  winner?: "player" | "cpu";
}

export interface HasScores {
  scores: {
    player: number;
    cpu: number;
  };
}
`;

test("scaffoldNode reuses the registry's contract for a bare field", async () => {
  const fs = fakeFs({
    "nodes/state.ts": registry,
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
    "scores:{ player: number; cpu: number }",
  ]);
  expect(next).toBe("DONE");
  const node = fs.files.get("nodes/kps-result.ts") ?? "";
  expect(node).toContain(
    "export interface State extends HasPlayerHealth, HasBoard, HasWinner, HasScores {}",
  );
  expect(node).not.toContain("Board }");
  expect(fs.files.get("nodes/state.ts")).toBe(registry);
  const testFile = fs.files.get("nodes/tests/kps-result.test.ts") ?? "";
  expect(testFile).toContain("playerHealth: 0,");
  expect(testFile).toContain("board: {} as Board,");
  expect(testFile).not.toContain("winner");
  expect(testFile).toContain(
    'import type { Board } from "../../utils/game.ts";',
  );
  expect(fs.errors).toEqual([]);
  expect(fs.formatted).not.toContain("nodes/state.ts");
});

test("scaffoldNode appends a new contract to the registry", async () => {
  const fs = fakeFs({
    "nodes/state.ts": registry,
    "nodes/a.ts": "export interface Move {\n  x: number;\n}\n",
    "utils/game.ts":
      "export type Board = string[][];\nexport type Tile = 0 | 1;\n",
  });
  await run(fs, [
    "b",
    "--terminal",
    "--state",
    "move:Move | null",
    "--state",
    "tile:Tile",
    "--state",
    "board",
  ]);
  const state = fs.files.get("nodes/state.ts") ?? "";
  expect(state).toStartWith(
    'import type { Board, Tile } from "../utils/game.ts";\nimport type { Move } from "./a.ts";\n',
  );
  expect(state).toEndWith(
    "export interface HasMove {\n  move: Move | null;\n}\n\nexport interface HasTile {\n  tile: Tile;\n}\n",
  );
  expect(fs.files.get("nodes/b.ts")).toContain(
    'import type { HasBoard, HasMove, HasTile } from "./state.ts";',
  );
  expect(fs.files.get("nodes/tests/b.test.ts")).toContain("move: null,");
  expect(fs.out.slice(0, 2)).toEqual([
    "Added HasMove to nodes/state.ts",
    "Added HasTile to nodes/state.ts",
  ]);
});

test("scaffoldNode keeps everything after the first colon as the type", async () => {
  const fs = fakeFs();
  await run(fs, ["x", "--terminal", "--state", "m:Record<string, number>"]);
  expect(fs.files.get("nodes/state.ts")).toContain(
    "m: Record<string, number>;",
  );
});

test("scaffoldNode reuses a contract given again with the same type", async () => {
  const fs = fakeFs({ "nodes/state.ts": registry });
  const [next] = await run(fs, [
    "x",
    "--terminal",
    "--state",
    "player_health:number",
  ]);
  expect(next).toBe("DONE");
  expect(fs.files.get("nodes/state.ts")).toBe(registry);
});

test("scaffoldNode warns about a type no file exports", async () => {
  const fs = fakeFs();
  const [next] = await run(fs, ["b", "--terminal", "--state", "board:Board"]);
  expect(next).toBe("DONE");
  expect(fs.errors).toEqual([
    "Warning: no file in nodes/ or utils/ exports the type Board; declare or import it in nodes/state.ts",
  ]);
});

test("scaffoldNode fails when the registry lacks an untyped field (exit code 2)", async () => {
  const fs = fakeFs({
    "nodes/a.ts": "export interface State {\n  hp: number;\n}\n",
  });
  const [next, state] = await run(fs, ["b", "--terminal", "--state", "hp"]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
  expect(fs.errors[0]).toBe(
    "Error: nodes/state.ts has no HasHp; give the field's type: --state hp:<Type>",
  );
  expect(fs.files.has("nodes/b.ts")).toBe(false);
});

test("scaffoldNode fails when a type conflicts with the registry's (exit code 2)", async () => {
  const fs = fakeFs({ "nodes/state.ts": registry });
  const [next, state] = await run(fs, [
    "c",
    "--terminal",
    "--state",
    "player_health:string",
  ]);
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
  expect(fs.errors[0]).toContain(
    "nodes/state.ts gives HasPlayerHealth the type number, not string",
  );
  expect(fs.files.get("nodes/state.ts")).toBe(registry);
  expect(fs.files.has("nodes/c.ts")).toBe(false);
});

test("scaffoldNode imports a type the registry itself exports into the test", async () => {
  const fs = fakeFs({
    "nodes/state.ts":
      "export type Tile = 0 | 1;\n\nexport interface HasTile {\n  tile: Tile;\n}\n",
  });
  await run(fs, ["x", "--terminal", "--state", "tile", "--state", "next:Tile"]);
  const state = fs.files.get("nodes/state.ts") ?? "";
  expect(state).not.toContain("import");
  expect(state).toContain("export interface HasNext {\n  next: Tile;\n}\n");
  expect(fs.files.get("nodes/tests/x.test.ts")).toContain(
    'import type { Tile } from "../state.ts";',
  );
  expect(fs.errors).toEqual([]);
});
