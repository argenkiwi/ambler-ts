#!/usr/bin/env bun
/**
 * Native Ambler CLI for TypeScript / Bun projects adhering to the Ambler Tooling Protocol (ATP).
 *
 * Thin entry point: the behaviour lives in specs/cli.md and walks/cli.ts.
 */
import { run } from "./walks/cli.ts";

try {
  process.exit(await run(process.argv.slice(2)));
} catch (err) {
  console.error(err);
  process.exit(1);
}
