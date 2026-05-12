import { NodeFactory } from "../ambler.ts";
import { getPrompt } from "../utils/prompt.ts";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface State {
  messages: Message[];
}

export type Edge = "onMessage" | "onQuit";

export type Utils = {
  prompt: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  prompt: (msg) => getPrompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const input = utils.prompt("You: ");

    if (
      input === null ||
      ["bye", "exit", "quit"].includes(input.toLowerCase().trim())
    ) {
      return [edges.onQuit, state];
    }

    const nextState = {
      ...state,
      messages: [
        ...state.messages,
        { role: "user", content: input } as Message,
      ],
    };

    return [edges.onMessage, nextState];
  };
};
