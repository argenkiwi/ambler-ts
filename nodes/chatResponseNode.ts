import { ollamaChat } from "../utils/ollama_chat.ts";
import { NodeFactory } from "../ambler.ts";

export type Message = { role: string; content: string };

export interface Input {
  ollamaHost: string;
  selectedModel: string;
  messages: Message[];
}

export interface Output {
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

export const factory: NodeFactory<Edge, Utils, Input, Output> = (
  edges,
  utils = defaultUtils,
) => {
  return async (input) => {
    const reply = await utils.chat(
      input.ollamaHost,
      input.selectedModel,
      input.messages,
    );

    utils.print(`Assistant: ${reply}`);
    const messages: Message[] = [
      ...input.messages,
      { role: "assistant", content: reply },
    ];

    return [edges.onPrompt, { messages }];
  };
};
