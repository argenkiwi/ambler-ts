import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onWin" | "onLose" | "onContinue";

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
  const lastLetter = state.guessedLetters[state.guessedLetters.length - 1];
  const newRevealed = [...state.revealed];

  // Reveal matching letter positions
  state.word.split("").forEach((letter, i) => {
    if (letter === lastLetter) {
      newRevealed[i] = true;
    }
  });

  let newWrongGuesses = state.wrongGuesses;
  if (!state.word.includes(lastLetter)) {
    newWrongGuesses = state.wrongGuesses + 1;
    utils.print(`'${lastLetter}' is not in the word.`);
  } else {
    utils.print(`'${lastLetter}' is in the word!`);
  }

  const allRevealed = state.word.split("").every((letter, i) => newRevealed[i]);

  if (allRevealed) {
    return [edges.onWin, {
      ...state,
      revealed: newRevealed,
      wrongGuesses: newWrongGuesses,
      gameOver: true,
    }];
  }

  if (newWrongGuesses >= state.maxWrong) {
    return [edges.onLose, {
      ...state,
      revealed: newRevealed,
      wrongGuesses: newWrongGuesses,
      gameOver: true,
    }];
  }

  return [edges.onContinue, {
    ...state,
    revealed: newRevealed,
    wrongGuesses: newWrongGuesses,
  }];
};
