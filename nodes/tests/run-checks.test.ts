import { expect, test } from "bun:test";
import { factory } from "../run-checks.ts";

const edges = { onDone: "DONE", onError: "ERROR" };

function fake(failAt?: string, code = 3) {
  const ran: string[] = [];
  const out: string[] = [];
  const utils = {
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
