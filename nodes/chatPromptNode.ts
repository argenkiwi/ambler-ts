import { Next, Nextable } from "../ambler.ts";

export namespace ChatPromptNode {
  export type Message = { role: string; content: string };

  export interface State {
    messages: Message[];
  }

  export type Edges<S extends State> = {
    onChat: Nextable<S>;
    onQuit: Nextable<S>;
  };

  export type Utils = {
    readLine: (prompt: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  const QUIT_WORDS = new Set(["bye", "exit", "quit"]);

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const input = await utils.readLine("You: ");
      if (input === null) {
        return new Next(edges.onQuit, state);
      }
      const trimmed = input.trim();
      if (QUIT_WORDS.has(trimmed.toLowerCase())) {
        return new Next(edges.onQuit, state);
      }
      const messages: Message[] = [...state.messages, { role: "user", content: trimmed }];
      return new Next(edges.onChat, { ...state, messages });
    };
  }
}
