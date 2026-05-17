import { NodeFactory } from "../ambler.ts";

export interface State {
  data: string[][];
}

export type Edge = "onComplete";

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
  if (state.data.length === 0) {
    utils.print("No rows in the file.");
  } else {
    state.data.forEach((row, idx) => {
      utils.print(`  ${idx + 1}. ${row.join(", ")}`);
    });
  }
  return [edges.onComplete, state];
};
