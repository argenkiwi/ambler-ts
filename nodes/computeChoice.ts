import { NodeFactory } from "../ambler.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

export type Edge = "onComplete";

export type Utils = {
  random: () => number;
};

const defaultUtils: Utils = {
  random: () => Math.random(),
};

const CHOICES = ["rock", "paper", "scissors"];

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const index = Math.floor(utils.random() * CHOICES.length);
  const computerChoice = CHOICES[index];

  return [edges.onComplete, { ...state, computerChoice }];
};
