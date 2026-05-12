import { NodeFactory } from "../ambler.ts";

export interface State {
  cpuMove: string | null;
}

export type Edge = "onSuccess";

export type Utils = {
  randomMove: () => string;
};

const MOVES = ["kick", "punch", "sweep", "crouch", "block", "jump"];

const defaultUtils: Utils = {
  randomMove: () => MOVES[Math.floor(Math.random() * MOVES.length)],
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const cpuMove = utils.randomMove();
  return [edges.onSuccess, { ...state, cpuMove }];
};
