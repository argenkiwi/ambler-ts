import { NodeFactory } from "../ambler.ts";

export interface State {
  word: string;
  guessed: string[];
  won: boolean;
}

export type Edge = "onPlay" | "onExit";

export type Utils = {
  print: (msg: string) => void;
  clearScreen: () => void;
  readKey: () => Promise<string | null>;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  clearScreen: () => console.clear(),
  readKey: async () => {
    const buf = new Uint8Array(8);
    Deno.stdin.setRaw(true);
    try {
      const n = await Deno.stdin.read(buf);
      if (n === null) return null;
      const byte = buf[0];
      if (byte === 27) return "\x1b";
      if (byte === 13 || byte === 10) return "\r";
      return String.fromCharCode(byte);
    } finally {
      Deno.stdin.setRaw(false);
    }
  },
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  utils.clearScreen();
  utils.print("HANGMAN");
  utils.print("");
  utils.print("A console-based word guessing game.");
  utils.print("Guess the hidden word one letter at a time.");
  utils.print("Six wrong guesses and it's game over!");
  utils.print("");
  utils.print("[enter] play  [escape] quit");

  while (true) {
    const key = await utils.readKey();
    if (key === "\x1b") return [edges.onExit, state];
    if (key === "\r") return [edges.onPlay, state];
  }
};
