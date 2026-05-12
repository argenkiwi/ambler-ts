import { NodeFactory } from "../ambler.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

export type Edge = "onPlayAgain" | "onQuit";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const input = utils.readLine("Play again? (yes/no): ");

  if (input === null || input.trim().toLowerCase() === "yes" || input.trim().toLowerCase() === "y") {
    return [edges.onPlayAgain, { ...state, userChoice: null, computerChoice: null, result: null }];
  }

  utils.print("Thanks for playing!");
  return [edges.onQuit, state];
};
