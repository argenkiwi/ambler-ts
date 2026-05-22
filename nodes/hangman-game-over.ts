import { NodeFactory } from "../ambler.ts";
import { GALLOWS, readKey, renderWord, TITLE } from "../utils/hangman.ts";

export interface State {
  word: string;
  guessed: string[];
  won: boolean;
}

export type Edge = "onPlayAgain" | "onExit";

export type Utils = {
  print: (msg: string) => void;
  clearScreen: () => void;
  readKey: () => Promise<string | null>;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  clearScreen: () => console.clear(),
  readKey,
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const incorrectCount = state.guessed.filter(
    (l) => !state.word.includes(l),
  ).length;

  utils.clearScreen();
  utils.print(TITLE);
  utils.print(GALLOWS[incorrectCount].join("\n"));
  utils.print("");
  utils.print(renderWord(state.word, state.word.split("")));
  utils.print("");

  if (state.won) {
    utils.print("You win!");
  } else {
    utils.print("You lose...");
    utils.print(`The answer was: ${state.word}`);
  }

  utils.print("");
  utils.print("[enter] play again  [escape] quit");

  while (true) {
    const key = await utils.readKey();
    if (key === "\x1b") return [edges.onExit, state];
    if (key === "\r") return [edges.onPlayAgain, state];
  }
};
