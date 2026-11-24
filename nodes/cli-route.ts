import type { NodeFactory } from "../ambler.ts";

export interface State {
  argv: string[];
  command?: string;
  exitCode: number;
}

export type Edge =
  | "onNode"
  | "onWalk"
  | "onUtil"
  | "onCheck"
  | "onHelp"
  | "onUnknown";

export const factory: NodeFactory<State, Edge> = (edges) => (state) => {
  const [command, ...rest] = state.argv;
  const next = { ...state, argv: rest, command };

  switch (command) {
    case "node":
      return [edges.onNode, next];
    case "walk":
      return [edges.onWalk, next];
    case "util":
      return [edges.onUtil, next];
    case "check":
      return [edges.onCheck, next];
    case "--help":
    case "-h":
      return [edges.onHelp, { ...next, exitCode: 0 }];
    case undefined:
      return [edges.onHelp, { ...next, exitCode: 2 }];
    default:
      return [edges.onUnknown, next];
  }
};
