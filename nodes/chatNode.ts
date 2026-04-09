import { Next, Nextable } from "../ambler.ts";
import { chat } from "../utils/ollama.ts";

const EXIT_COMMANDS = new Set(["/quit", "/exit", "/bye"]);

export namespace ChatNode {
  export interface State {
    model: string;
  }

  export type Edges<S extends State> = {
    onContinue: Nextable<S>;
  };

  export type Utils = {
    chat: (model: string, prompt: string) => Promise<string>;
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    chat,
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const input = await utils.readLine("> ");
      const trimmed = (input ?? "").trim();

      if (EXIT_COMMANDS.has(trimmed)) {
        utils.print("Goodbye!");
        return null;
      }

      if (!trimmed) {
        return new Next(edges.onContinue, state);
      }

      const response = await utils.chat(state.model, trimmed);
      utils.print(response);
      return new Next(edges.onContinue, state);
    };
  }
}
