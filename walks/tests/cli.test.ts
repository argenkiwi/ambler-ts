import { expect, test } from "bun:test";

test("cli --help outputs usage", () => {
  const proc = Bun.spawnSync(["bun", "cli.ts", "--help"]);
  expect(proc.exitCode).toBe(0);
  const out = new TextDecoder().decode(proc.stdout);
  expect(out).toContain("Usage: bun cli.ts");
  expect(out).toContain("node");
  expect(out).toContain("walk");
  expect(out).toContain("check");
});
