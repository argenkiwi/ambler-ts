import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onWin";

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
  utils.print("");
  utils.print(`🎉 Congratulations! You guessed the word: ${state.word}`);
  utils.print(`Wrong guesses: ${state.wrongGuesses}/${state.maxWrong}`);
  utils.print("");

  return [edges.onWin, { ...state }];
};
