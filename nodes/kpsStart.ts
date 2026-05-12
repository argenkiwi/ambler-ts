import { NodeFactory } from "../ambler.ts";

export interface State {
  playerHealth: number;
  cpuHealth: number;
}

export type Edge = "onSuccess";

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
  utils.print("Welcome to Kick-Punch-Sweep!");
  return [edges.onSuccess, { ...state, playerHealth: 10, cpuHealth: 10 }];
};
