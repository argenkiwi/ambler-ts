import { expect, test } from "bun:test";
import { createWalk } from "../cli.ts";

test("cli --help outputs usage", () => {
  const proc = Bun.spawnSync(["bun", "cli.ts", "--help"]);
  expect(proc.exitCode).toBe(0);
  const out = new TextDecoder().decode(proc.stdout);
  expect(out).toContain("Usage: bun run ambler");
  expect(out).toContain("node");
  expect(out).toContain("walk");
  expect(out).toContain("check");
});

test("cli walk routes commands to the right handler", async () => {
  const printed: string[] = [];
  const errors: string[] = [];
  const machine = createWalk({
    cliHelp: {
      print: (m) => printed.push(m),
      printError: (m) => errors.push(m),
    },
    cliError: { printError: (m) => errors.push(m) },
    runChecks: {
      sources: () => ({}),
      run: () => 0,
      print: (m) => printed.push(m),
      printError: () => {},
    },
  });

  const [helpNext, helpState] = await machine("CLI_ROUTE", {
    argv: [],
    exitCode: 0,
  });
  expect(helpNext).toBe("CLI_HELP");
  expect(helpState.exitCode).toBe(2);

  const [badNext] = await machine("CLI_ROUTE", {
    argv: ["bogus"],
    exitCode: 0,
  });
  expect(badNext).toBe("CLI_ERROR");

  const [checkNext] = await machine("CLI_ROUTE", {
    argv: ["check"],
    exitCode: 0,
  });
  expect(checkNext).toBe("RUN_CHECKS");
});

test("cli help prints a topic's guide, and exits 1 for an unknown topic", () => {
  const ok = Bun.spawnSync(["bun", "cli.ts", "help", "node-design"]);
  expect(ok.exitCode).toBe(0);
  expect(new TextDecoder().decode(ok.stdout)).toStartWith("# Node design");

  const bad = Bun.spawnSync(["bun", "cli.ts", "help", "bogus"]);
  expect(bad.exitCode).toBe(1);
  expect(new TextDecoder().decode(bad.stderr)).toContain("No guide for bogus");
});

test("cli exits 2 with an error for an unknown command", () => {
  const proc = Bun.spawnSync(["bun", "cli.ts", "bogus"]);
  expect(proc.exitCode).toBe(2);
  expect(new TextDecoder().decode(proc.stderr)).toContain(
    "Unknown command: bogus",
  );
});
