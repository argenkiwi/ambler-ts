import { Ollama } from 'npm:ollama'
import { Next, Nextable } from "../ambler.ts";

export namespace ModelSelectNode {
  export interface State {
    selectedModel: string;
    ollamaHost: string;
  }

  export type Edges<S extends State> = {
    onSelect: Nextable<S>;
  };

  export type Utils = {
    listModels: (host: string) => Promise<string[]>;
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    listModels: async (host: string) => {
      const ollama = new Ollama({ host })
      const response = await ollama.list();
      return response.models.map((m) => m.name);
    },
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const models = await utils.listModels(state.ollamaHost);
      utils.print("Available models:");
      models.forEach((m, i) => utils.print(`${i}: ${m}`));

      const input = await utils.readLine("Select model index: ");
      if (input === null) return null;

      const index = parseInt(input);
      if (isNaN(index) || index < 0 || index >= models.length) {
        utils.print("Invalid selection.");
        return new Next(edges.onSelect, state); // Or error? Let's say retry.
      }

      utils.print(`Selected model: ${models[index]}`);
      return new Next(edges.onSelect, { ...state, selectedModel: models[index] });
    };
  }
}
