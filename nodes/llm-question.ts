import { NodeFactory } from "../ambler.ts";
import { ollamaChat } from "../utils/ollama_chat.ts";
import { Message } from "./game-start.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
  questionCount: number;
}

export type Edge = "onSuccess";

export type Utils = {
  chat: (messages: Message[], model: string, host: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: (messages, model, host) => ollamaChat(messages, model, host),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const response = await utils.chat(state.messages, state.model, state.host);

    utils.print(`\nLLM (Q ${state.questionCount + 1}): ${response}`);

    const nextState = {
      ...state,
      messages: [
        ...state.messages,
        { role: "assistant", content: response } as Message,
      ],
      questionCount: state.questionCount + 1,
    };

    return [edges.onSuccess, nextState];
  };
};
