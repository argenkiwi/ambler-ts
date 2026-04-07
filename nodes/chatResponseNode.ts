import ollama from "npm:ollama";
import { Next, Nextable } from "../ambler.ts";

export namespace ChatResponseNode {
  export type Message = { role: string; content: string };

  export interface State {
    messages: Message[];
  }

  export type Edges<S extends State> = {
    onPrompt: Nextable<S>;
  };

  export type Utils = {
    chat: (messages: Message[]) => Promise<string>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    chat: async (messages: Message[]) => {
      const response = await ollama.chat({ model: "llama3.2", messages });
      return response.message.content;
    },
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const reply = await utils.chat(state.messages);
      utils.print(`Assistant: ${reply}`);
      const messages: Message[] = [...state.messages, { role: "assistant", content: reply }];
      return new Next(edges.onPrompt, { ...state, messages });
    };
  }
}
