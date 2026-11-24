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
