import { NodeFactory } from "../ambler.ts";
import { getPrompt } from "../utils/prompt.ts";
import { Message } from "./game-start.ts";

export interface State {
  messages: Message[];
  outcome?: "win" | "loss" | "quit";
}

export type Edge = "onSuccess" | "onQuit";

export type Utils = {
  getPrompt: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  getPrompt: (msg: string) => getPrompt(msg),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const input = utils.getPrompt("You: ");

    if (
      input === null ||
      ["quit", "exit"].includes(input.toLowerCase().trim())
    ) {
      return [edges.onQuit, { ...state, outcome: "quit" }];
    }

    const nextState = {
      ...state,
      messages: [
        ...state.messages,
        { role: "user", content: input } as Message,
      ],
    };

    return [edges.onSuccess, nextState];
  };
};
