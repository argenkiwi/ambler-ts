import type { NodeFactory } from "../ambler.ts";

export interface State {
  exitCode: number;
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const USAGE = `Usage: bun cli.ts <command> [options]

Commands:
  node <name> (--outcomes <a,b> | --terminal) [--state <fields>]
  walk <name> --nodes <n1,n2> [--edge <e=t>] [--no-runner]
  util <name>
  check [--lint-only]
`;

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  (state) => {
    utils.print(USAGE);
    return [edges.onDone, state];
  };
