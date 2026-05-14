import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

export type Edge = "onReady";

export type Utils = {
  print: (msg: string) => void;
};

const WORDS = [
  "cat",
  "dog",
  "bird",
  "fish",
  "house",
  "table",
  "apple",
  "banana",
  "cherry",
  "dance",
  "eagle",
  "flame",
  "ghost",
  "heart",
  "index",
  "jewel",
  "karma",
  "lemon",
  "maple",
  "ninja",
  "ocean",
  "panda",
  "queen",
  "radio",
  "snake",
  "tiger",
  "umbrella",
  "violin",
  "whale",
  "xenon",
  "yacht",
  "zebra",
];

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const revealed = new Array(word.length).fill(false);

  utils.print("\n=== New Game: guess the word! ===");

  return [edges.onReady, {
    ...state,
    word,
    revealed,
    wrongGuesses: 0,
    maxWrong: 6,
    guessedLetters: [],
    gameOver: false,
  }];
};
