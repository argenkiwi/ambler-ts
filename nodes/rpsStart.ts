import { NodeFactory } from "../ambler.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

const VALID_CHOICES = ["rock", "paper", "scissors"];

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const input = utils.readLine("Enter Rock, Paper, or Scissors: ");

  if (input === null) {
    return [edges.onError, state];
  }

  const choice = input.trim().toLowerCase();

  if (!VALID_CHOICES.includes(choice)) {
    utils.print("Error: Invalid choice. Please enter Rock, Paper, or Scissors.");
    return [edges.onError, state];
  }

  return [edges.onSuccess, { ...state, userChoice: choice }];
};
