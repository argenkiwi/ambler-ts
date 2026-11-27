import type { NodeFactory } from "../../ambler.ts";
import type { HasCount } from "./state.ts";

export interface State extends HasCount {}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  (state) => {
    utils.print(`Final count: ${state.count}`);
    return [edges.onDone, state];
  };
