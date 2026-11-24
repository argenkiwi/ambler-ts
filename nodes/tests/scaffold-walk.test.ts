import { expect, test } from "bun:test";
import { factory } from "../scaffold-walk.ts";
import { fakeFs } from "./fake-fs.ts";

const edges = { onDone: "DONE", onError: "ERROR" };
const run = (fs: ReturnType<typeof fakeFs>, argv: string[]) =>
  factory(edges, fs.utils)({ argv, exitCode: 0 });

test("scaffoldWalk writes walk, test and spec with the edge wiring", async () => {
  const fs = fakeFs();
  const [next] = await run(fs, [
    "demo",
    "--nodes",
    "start,finish",
    "--edge",
    "start.success=finish",
    "--edge",
    "finish.done=null",
  ]);
  expect(next).toBe("DONE");
  const walk = fs.files.get("walks/demo.ts") ?? "";
  expect(walk).toContain(
    'START: () => startNode.factory({ onSuccess: "FINISH" }',
  );
  expect(walk).toContain("FINISH: () => finishNode.factory({ onDone: null }");
  expect(fs.files.has("walks/tests/demo.test.ts")).toBe(true);
  expect(fs.files.get("specs/demo.md")).toContain("Initial node: `start`.");
});

test("scaffoldWalk keeps an existing spec", async () => {
  const fs = fakeFs({ "specs/demo.md": "mine" });
  await run(fs, ["demo", "--nodes", "start"]);
  expect(fs.files.get("specs/demo.md")).toBe("mine");
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
