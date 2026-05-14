import { NodeFactory } from "../ambler.ts";

export interface State {
  questionCount: number;
  outcome?: "win" | "loss" | "quit";
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    if (state.outcome === "win") {
      utils.print("\nGG! I guessed it! I'm so smart.");
    } else if (state.outcome === "loss") {
      utils.print("\nI give up! You win. I couldn't guess it in 20 questions.");
    } else {
      utils.print("\nGame ended. See you next time!");
    }

    utils.print(`Total questions asked: ${state.questionCount}`);
    return [edges.onDone, state];
  };
};
