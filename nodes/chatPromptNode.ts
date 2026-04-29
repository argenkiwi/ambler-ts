import { next } from "../ambler.ts";

export type Message = { role: string; content: string };

export interface State {
  messages: Message[];
}

export type Edges<K extends string = string> = {
  onChat: K | null;
  onQuit: K | null;
};

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

const QUIT_WORDS = new Set(["bye", "exit", "quit"]);

export function create<S extends State, K extends string = string>(
  edges: Edges<K>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    const input = utils.readLine("You: ");
    if (input === null) {
      return next(edges.onQuit, state);
    }
    const trimmed = input.trim();
    if (QUIT_WORDS.has(trimmed.toLowerCase())) {
      return next(edges.onQuit, state);
    }
    const messages: Message[] = [
      ...state.messages,
      { role: "user", content: trimmed },
    ];
    return next(edges.onChat, { ...state, messages });
  };
}
