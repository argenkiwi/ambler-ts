import { NodeFactory } from "../ambler.ts";

export interface State {
  nbPoints: number;
  bet: number;
  symbols: string[];
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (edges, utils = defaultUtils) =>
  (state) => {
    utils.print(`\nGame Over! Your final score: ${state.nbPoints} points.`);
    return [edges.onDone, state];
  };
