import { NodeFactory } from "../ambler.ts";
import { ollamaChat } from "../utils/ollama_chat.ts";
import { Message } from "./chat-prompt.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
}

export type Edge = "onComplete";

export type Utils = {
  chat: (messages: Message[], model: string, host: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: (messages, model, host) => ollamaChat(messages, model, host),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const response = await utils.chat(state.messages, state.model, state.host);

    utils.print(`Assistant: ${response}`);

    const nextState = {
      ...state,
      messages: [
        ...state.messages,
        { role: "assistant", content: response } as Message,
      ],
    };

    return [edges.onComplete, nextState];
  };
};
