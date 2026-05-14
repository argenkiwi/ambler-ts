import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onContinue" | "onQuit";

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
  const input = utils.readLine("Play again? (y/n): ");

  if (
    input &&
    (input.trim().toLowerCase() === "y" || input.trim().toLowerCase() === "yes")
  ) {
    return [edges.onContinue, { ...state }];
  }

  return [edges.onQuit, { ...state }];
};
