import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { todo } from "../utils/conventions.ts";

export interface State {
  argv: string[];
  exitCode: number;
}

export type Edge = "onDone" | "onError";

export type Utils = {
  /** The project's nodes, walks and utilities, tests included: each path and its text. */
  sources: () => Record<string, string>;
  /** Runs a command with inherited stdio and returns its exit code. */
  run: (cmd: string[]) => number;
  print: (msg: string) => void;
  printError: (msg: string) => void;
};

const CONVENTION_FOLDERS = ["nodes", "walks", "utils"];

function tsFiles(dir: string): string[] {
  try {
    return readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((name) => name.endsWith(".ts"))
      .map((name) => join(dir, name))
      .sort();
  } catch {
    return [];
  }
}

const defaultUtils: Utils = {
  sources: () =>
    Object.fromEntries(
      CONVENTION_FOLDERS.flatMap(tsFiles).map((path) => [
        path,
        readFileSync(path, "utf8"),
      ]),
    ),
  run: (cmd) =>
    Bun.spawnSync(cmd, { stdout: "inherit", stderr: "inherit" }).exitCode ?? 1,
  print: (msg) => console.log(msg),
  printError: (msg) => console.error(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  (state) => {
    const { values } = parseArgs({
      args: state.argv,
      options: { "lint-only": { type: "boolean" } },
      allowPositionals: true,
    });

    const sources = utils.sources();
    const violations = Object.keys(sources)
      .sort()
      .flatMap((path) => todo(path, sources[path] ?? ""));
    if (violations.length > 0) {
      for (const line of violations) utils.print(line);
      const plural = violations.length === 1 ? "" : "s";
      utils.printError(
        `Check failed: ${violations.length} convention violation${plural}`,
      );
      return [edges.onError, { ...state, exitCode: 1 }];
    }

    const commands: string[][] = [
      ["bun", "run", "check"],
      ["bun", "run", "lint"],
    ];
    if (!values["lint-only"]) {
      commands.push(["bun", "test", "nodes/tests", "walks/tests"]);
    }

    for (const cmd of commands) {
      utils.print(`Running ${cmd.join(" ")}...`);
      const code = utils.run(cmd);
      if (code !== 0) {
        utils.printError(`Check failed at step: ${cmd.join(" ")}`);
        return [edges.onError, { ...state, exitCode: code }];
      }
    }

    utils.print("All Ambler checks passed.");
    return [edges.onDone, state];
  };
