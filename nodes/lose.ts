import { NodeFactory } from "../ambler.ts";
import { renderHangman, renderWord } from "./display.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onLose";

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
  utils.print(renderHangman(state.wrongGuesses));
  utils.print(`Game over! The word was: ${state.word}`);
  utils.print(`You guessed: ${renderWord(state.word, state.revealed)}`);
  utils.print(`Wrong guesses: ${state.wrongGuesses}/${state.maxWrong}`);
  utils.print("");

  return [edges.onLose, { ...state }];
};
