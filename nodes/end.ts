import { NodeFactory } from "../ambler.ts";

export interface State {
  // No state needed for termination.
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  utils.print("Goodbye!");
  return [edges.onDone, state];
};
