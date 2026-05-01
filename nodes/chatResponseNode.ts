import { ollamaChat } from "../utils/ollama_chat.ts";
import { Next } from "../ambler.ts";

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

export function create<S extends State, N extends string>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
) {
  return async (state: S): Promise<Next<S, N>> => {
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
}
