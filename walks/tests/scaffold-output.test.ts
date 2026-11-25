import { afterAll, beforeAll, expect, test } from "bun:test";
import {
  cpSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/**
 * Scaffolds into a throwaway project that shares this repo's Biome, tsconfig
 * and toolchain, then runs them on the output: what `ambler node|walk|util`
 * writes must pass `ambler check --lint-only` unchanged.
 */
const repo = resolve(import.meta.dir, "../..");
let dir = "";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);

function sh(cmd: string[]) {
  const proc = Bun.spawnSync(cmd, { cwd: dir });
  return {
    code: proc.exitCode,
    out: decode(proc.stdout) + decode(proc.stderr),
  };
}

const ambler = (...args: string[]) =>
  sh(["bun", join(repo, "cli.ts"), ...args]);

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "ambler-scaffold-"));
  for (const file of ["ambler.ts", "biome.json"]) {
    cpSync(join(repo, file), join(dir, file));
  }
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      extends: join(repo, "tsconfig.json"),
      // Walks are left out until `ambler walk` merges the nodes' State.
      include: ["ambler.ts", "nodes", "utils"],
    }),
  );
  symlinkSync(join(repo, "node_modules"), join(dir, "node_modules"));
});

afterAll(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

test("scaffolded nodes, utils and walks pass biome check and tsc unchanged", () => {
  for (const args of [
    ["node", "probe", "--outcomes", "ready"],
    [
      "node",
      "long-named-thing",
      "--outcomes",
      "ready,invalid_input,something_else_happened",
      "--state",
      "count:number",
      "--state",
      "label",
    ],
    ["node", "stop", "--terminal"],
    ["util", "helper"],
    [
      "walk",
      "demo",
      "--nodes",
      "probe,long-named-thing,stop",
      "--edge",
      "probe.ready=long-named-thing",
    ],
  ]) {
    const { code, out } = ambler(...args);
    expect(out).toContain("Created");
    expect(code).toBe(0);
  }

  const lint = sh([
    join("node_modules", ".bin", "biome"),
    "check",
    "nodes",
    "walks",
    "utils",
  ]);
  expect(lint.out).not.toContain("×");
  expect(lint.code).toBe(0);

  const types = sh([join("node_modules", ".bin", "tsc"), "--noEmit"]);
  expect(types.out).toBe("");
  expect(types.code).toBe(0);
});
