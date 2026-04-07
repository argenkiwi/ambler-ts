import { Next, Nextable } from "../ambler.ts";

export namespace PromptNode {
  export interface Message {
    role: "user" | "assistant";
    content: string;
  }

  export interface State {
    messages: Message[];
  }

  export type Edges<S extends State> = {
    onInput: Nextable<S>;
    onExit: Nextable<S>;
  };

  export type Utils = {
    readLine: (msg: string) => Promise<string | null>;
  };

  const defaultUtils: Utils = {
    readLine: async (msg: string) => prompt(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const input = await utils.readLine("You: ");
      
      if (input === null) return new Next(edges.onExit, state);

      const trimmed = input.trim().toLowerCase();
      if (["bye", "quit", "exit"].includes(trimmed)) {
        return new Next(edges.onExit, state);
      }

      const newMessage: Message = { role: "user", content: input };
      return new Next(edges.onInput, { 
        ...state, 
        messages: [...state.messages, newMessage] 
      });
    };
  }
}
