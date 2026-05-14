import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onValid" | "onInvalid";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

function isValidGuess(input: string, guessedLetters: string[]): boolean {
  if (input.length !== 1) return false;
  if (!/[a-zA-Z]/.test(input)) return false;
  if (guessedLetters.includes(input.toLowerCase())) return false;
  return true;
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const input = utils.readLine("Your guess: ");

  if (input === null || input.trim() === "") {
    utils.print("Error: Please enter a single letter.");
    return [edges.onInvalid, { ...state }];
  }

  const letter = input.trim().toLowerCase();

  if (!isValidGuess(letter, state.guessedLetters)) {
    if (state.guessedLetters.includes(letter)) {
      utils.print(`You already guessed '${letter}'. Try again.`);
    } else if (!/[a-zA-Z]/.test(letter)) {
      utils.print("Error: Please enter a single alphabetic letter.");
    } else {
      utils.print("Error: Please enter a single letter.");
    }
    
    return [edges.onInvalid, { ...state }];
  }

  return [edges.onValid, {
    ...state,
    guessedLetters: [...state.guessedLetters, letter],
  }];
};
