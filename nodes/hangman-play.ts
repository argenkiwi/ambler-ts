import { NodeFactory } from "../ambler.ts";
import { GALLOWS, pickWord, readKey, renderWord } from "../utils/hangman.ts";

export interface State {
  word: string;
  guessed: string[];
  won: boolean;
}

export type Edge = "onGameOver" | "onExit";

export type Utils = {
  print: (msg: string) => void;
  clearScreen: () => void;
  readKey: () => Promise<string | null>;
  pickWord: () => string;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  clearScreen: () => console.clear(),
  readKey,
  pickWord,
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const word = utils.pickWord();
  let guessed: string[] = [];

  while (true) {
    const incorrectCount = guessed.filter((l) => !word.includes(l)).length;

    utils.clearScreen();
    utils.print(GALLOWS[incorrectCount].join("\n"));
    utils.print("");
    utils.print(renderWord(word, guessed));
    utils.print("");
    if (guessed.length > 0) {
      utils.print(`Guessed: ${[...guessed].sort().join(" ")}`);
      utils.print("");
    }

    const allGuessed = word.split("").every((l) => guessed.includes(l));
    if (allGuessed) {
      return [edges.onGameOver, { ...state, word, guessed, won: true }];
    }
    if (incorrectCount >= 6) {
      return [edges.onGameOver, { ...state, word, guessed, won: false }];
    }

    utils.print("[a-z] guess a letter  [escape] exit");

    const key = await utils.readKey();
    if (key === "\x1b") return [edges.onExit, state];
    if (key && /^[a-zA-Z]$/.test(key)) {
      const letter = key.toLowerCase();
      if (!guessed.includes(letter)) {
        guessed = [...guessed, letter];
      }
    }
  }
};
