import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";

export interface State {
  argv: string[];
  exitCode: number;
}

export type Edge = "onDone" | "onError";

export type Utils = {
  /** Runs a command with inherited stdio and returns its exit code. */
  run: (cmd: string[]) => number;
  print: (msg: string) => void;
  printError: (msg: string) => void;
};

const defaultUtils: Utils = {
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
