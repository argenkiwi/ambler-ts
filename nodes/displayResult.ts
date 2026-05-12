import { NodeFactory } from "../ambler.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
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
  const userDisplay = state.userChoice ? state.userChoice.charAt(0).toUpperCase() + state.userChoice.slice(1) : "Unknown";
  const computerDisplay = state.computerChoice ? state.computerChoice.charAt(0).toUpperCase() + state.computerChoice.slice(1) : "Unknown";

  utils.print(`You chose: ${userDisplay}`);
  utils.print(`Computer chose: ${computerDisplay}`);

  if (state.result === "Tie") {
    utils.print("Result: It's a Tie!");
  } else if (state.result === "Win") {
    utils.print("Result: You Win!");
  } else if (state.result === "Loss") {
    utils.print("Result: You Lose!");
  } else {
    utils.print("Result: Invalid round.");
  }

  return [edges.onComplete, state];
};
