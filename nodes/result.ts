import { NodeFactory } from "../ambler.ts";

export interface State {
  playerHealth: number;
  cpuHealth: number;
}

export type Edge = "onContinue" | "onGameOver";

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
  if (state.playerHealth > 0 && state.cpuHealth > 0) {
    return [edges.onContinue, state];
  }

  if (state.playerHealth <= 0 && state.cpuHealth <= 0) {
    utils.print("\nIT'S A DOUBLE KNOCKOUT! IT'S A DRAW!");
  } else if (state.playerHealth <= 0) {
    utils.print("\nYOU HAVE BEEN DEFEATED! CPU WINS!");
  } else {
    utils.print("\nVICTORY! YOU HAVE DEFEATED THE CPU!");
  }

  return [edges.onGameOver, state];
};
