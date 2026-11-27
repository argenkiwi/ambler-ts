import type { NodeFactory } from "../ambler.ts";
import type { HasCommand, HasExitCode } from "./state.ts";

export interface State extends HasCommand, HasExitCode {}

export type Edge = "onDone";

export type Utils = {
  printError: (msg: string) => void;
};

const defaultUtils: Utils = {
  printError: (msg) => console.error(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  (state) => {
    utils.printError(`Unknown command: ${state.command}`);
    return [edges.onDone, { ...state, exitCode: 2 }];
  };
