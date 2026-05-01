import { ollamaChat } from "../utils/ollama_chat.ts";
import { NodeFactory } from "../ambler.ts";

export type Message = { role: string; content: string };

export interface State {
  ollamaHost: string;
  selectedModel: string;
  messages: Message[];
}

export type Edge = "onPrompt";

export type Utils = {
  chat: (
    host: string,
    model: string,
    messages: Message[],
  ) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: ollamaChat,
  print: (msg) => console.log(msg),
};

const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const reply = await utils.chat(
      state.ollamaHost,
      state.selectedModel,
      state.messages,
    );
    utils.print(`Assistant: ${reply}`);
    const messages: Message[] = [
      ...state.messages,
      { role: "assistant", content: reply },
    ];
    return [edges.onPrompt, { ...state, messages }];
  };
};

export default create;
