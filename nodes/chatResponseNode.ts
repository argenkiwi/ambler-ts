import { ollamaChat } from "../utils/ollama_chat.ts";
import { defaultPrint, next, Nextable } from "../ambler.ts";

export type Message = { role: string; content: string };

export interface State {
  messages: Message[];
  ollamaHost: string;
  selectedModel: string;
}

export type Edges<S extends State> = {
  onPrompt: Nextable<S>;
};

export type Utils = {
  chat: (messages: Message[], host: string, model: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: async (messages: Message[], host: string, model: string) => {
    return await ollamaChat(host, model, messages);
  },
  print: defaultPrint,
};

export function create<S extends State>(edges: Edges<S>, utils: Utils = defaultUtils) {
  return async (state: S) => {
    const reply = await utils.chat(
      state.messages,
      state.ollamaHost,
      state.selectedModel
    );
    utils.print(`Assistant: ${reply}`);
    const messages: Message[] = [
      ...state.messages,
      { role: "assistant", content: reply },
    ];
    return next(edges.onPrompt, { ...state, messages });
  };
}
