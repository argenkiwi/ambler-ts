import { expect, test } from "bun:test";
import { factory } from "../run-checks.ts";

const edges = { onDone: "DONE", onError: "ERROR" };

function fake(failAt?: string, code = 3, files: Record<string, string> = {}) {
  const ran: string[] = [];
  const out: string[] = [];
  const utils = {
    sources: () => files,
    run: (cmd: string[]) => {
      ran.push(cmd.join(" "));
      return cmd.join(" ") === failAt ? code : 0;
    },
    print: (m: string) => out.push(m),
    printError: (m: string) => out.push(m),
  };
  return { ran, out, utils };
}

test("runChecks runs check, lint and tests, then transitions to onDone", async () => {
  const { ran, out, utils } = fake();
  const [next, state] = await factory(edges, utils)({ argv: [], exitCode: 0 });
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(0);
  expect(ran).toEqual([
    "bun run check",
    "bun run lint",
    "bun test nodes/tests walks/tests",
  ]);
  expect(out.at(-1)).toBe("All Ambler checks passed.");
});

test("runChecks skips tests with --lint-only", async () => {
  const { ran, utils } = fake();
  await factory(edges, utils)({ argv: ["--lint-only"], exitCode: 0 });
  expect(ran).toEqual(["bun run check", "bun run lint"]);
});

test("runChecks stops at the first failure with that exit code", async () => {
  const { ran, out, utils } = fake("bun run check", 3);
  const [next, state] = await factory(edges, utils)({ argv: [], exitCode: 0 });
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(3);
  expect(ran).toEqual(["bun run check"]);
  expect(out.at(-1)).toBe("Check failed at step: bun run check");
});

// Built in pieces so that this test is not itself a placeholder the rule finds.
const UNFINISHED = `throw new Error("${["not yet", "implemented"].join(" ")}");\n`;

const BYE = "export type State = object;\nexport const x = 1;\n";

test("runChecks reports placeholders left and fails before any tool runs", async () => {
  for (const argv of [[], ["--lint-only"]]) {
    const { ran, out, utils } = fake(undefined, 3, {
      "nodes/greet.ts": `export type State = object;\n${UNFINISHED}`,
      "nodes/bye.ts": BYE,
      "walks/tests/hello.test.ts": `\n${UNFINISHED}`,
    });
    const [next, state] = await factory(edges, utils)({ argv, exitCode: 0 });
    expect(next).toBe("ERROR");
    expect(state.exitCode).toBe(1);
    expect(ran).toEqual([]);
    expect(out.map((line) => line.split(": todo: ")[0])).toEqual([
      "nodes/greet.ts:2",
      "walks/tests/hello.test.ts:2",
      "Check failed: 2 convention violations",
    ]);
  }
});

test("runChecks goes on to the tools when no placeholder is left", async () => {
  const { ran, utils } = fake(undefined, 3, { "nodes/bye.ts": BYE });
  const [next] = await factory(edges, utils)({ argv: [], exitCode: 0 });
  expect(next).toBe("DONE");
  expect(ran.length).toBe(3);
});

test("runChecks reports state contract violations and fails before any tool runs", async () => {
  const { ran, out, utils } = fake(undefined, 3, {
    "nodes/state.ts":
      "export interface HasHp {\n  hp: number;\n  mp: number;\n}\n",
    "nodes/bye.ts": "export const x = 1;\n",
  });
  const [next, state] = await factory(edges, utils)({ argv: [], exitCode: 0 });
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(1);
  expect(ran).toEqual([]);
  expect(out.map((line) => line.split(": state-contracts: ")[0])).toEqual([
    "nodes/bye.ts:1",
    "nodes/state.ts:1",
    "Check failed: 2 convention violations",
  ]);
});
