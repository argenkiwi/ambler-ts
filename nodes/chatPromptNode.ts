import { NodeFactory } from "../ambler.ts";

export type Message = { role: string; content: string };

export interface Input {
  messages: Message[];
}

export interface Output {
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

export const factory: NodeFactory<Edge, Utils, Input, Output> = (
  edges,
  utils = defaultUtils,
) =>
(input) => {
  const userInput = utils.readLine("You: ");
  if (userInput === null) {
    return [edges.onQuit, input];
  }

  const trimmed = userInput.trim();
  if (QUIT_WORDS.has(trimmed.toLowerCase())) {
    return [edges.onQuit, input];
  }

  const messages: Message[] = [
    ...input.messages,
    { role: "user", content: trimmed },
  ];

  return [edges.onChat, { messages }];
};
