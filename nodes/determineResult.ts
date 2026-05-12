import { NodeFactory } from "../ambler.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

export type Edge = "onComplete";

export const factory: NodeFactory<State, Edge> = (edges) =>
(state) => {
  if (!state.userChoice || !state.computerChoice) {
    return [edges.onComplete, { ...state, result: "Invalid" }];
  }

  if (state.userChoice === state.computerChoice) {
    return [edges.onComplete, { ...state, result: "Tie" }];
  }

  const wins: Record<string, string> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  if (wins[state.userChoice] === state.computerChoice) {
    return [edges.onComplete, { ...state, result: "Win" }];
  }

  return [edges.onComplete, { ...state, result: "Loss" }];
};
