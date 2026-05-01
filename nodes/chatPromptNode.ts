import { NodeFactory } from "../ambler.ts";

export type Message = { role: string; content: string };

export interface State {
  messages: Message[];
}

export type Edge = "onChat" | "onQuit";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

const QUIT_WORDS = new Set(["bye", "exit", "quit"]);

const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const input = utils.readLine("You: ");
    if (input === null) {
      return [edges.onQuit, state];
    }
    const trimmed = input.trim();
    if (QUIT_WORDS.has(trimmed.toLowerCase())) {
      return [edges.onQuit, state];
    }
    const messages: Message[] = [
      ...state.messages,
      { role: "user", content: trimmed },
    ];
    return [edges.onChat, { ...state, messages }];
  };
};

export default create;
