import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onDisplay";

const HANGMAN: string[] = [
  `  +---+
  |   |
  |   |
  |   |
      |
      |
=======`,
  `  +---+
  |   |
  O   |
  |   |
      |
      |
=======`,
  `  +---+
  |   |
  O   |
  |   |
      |
      |
=======`,
  `  +---+
  |   |
  O   |
 /|   |
      |
      |
=======`,
  `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=======`,
  `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=======`,
  `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=======`,
];

export function renderWord(word: string, revealed: boolean[]): string {
  return word
    .split("")
    .map((letter, i) => (revealed[i] ? letter : "_"))
    .join(" ");
}

export function renderHangman(wrongGuesses: number): string {
  return HANGMAN[Math.min(wrongGuesses, HANGMAN.length - 1)];
}

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
  utils.print(renderHangman(state.wrongGuesses));
  utils.print(renderWord(state.word, state.revealed));
  utils.print(
    `Guessed: ${(state.guessedLetters.length > 0
      ? state.guessedLetters.join(", ")
      : "none")}`,
  );
  utils.print(`Wrong: ${state.wrongGuesses}/${state.maxWrong}`);
  utils.print("");

  return [edges.onDisplay, { ...state }];
};
