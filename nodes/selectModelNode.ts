import { Next, Nextable } from "../ambler.ts";
import { listModels } from "../utils/ollama.ts";

export namespace SelectModelNode {
  export interface State {
    model: string;
  }

  export type Edges<S extends State> = {
    onSuccess: Nextable<S>;
  };

  export type Utils = {
    listModels: () => Promise<string[]>;
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    listModels,
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const models = await utils.listModels();

      if (models.length === 0) {
        utils.print("No models available. Run `ollama pull <model>` first.");
        return null;
      }

      utils.print("Available models:");
      models.forEach((name, i) => utils.print(`  ${i + 1}. ${name}`));

      while (true) {
        const input = await utils.readLine("Select a model (enter number): ");
        const n = parseInt((input ?? "").trim(), 10);
        if (!isNaN(n) && n >= 1 && n <= models.length) {
          return new Next(edges.onSuccess, { ...state, model: models[n - 1] });
        }
        utils.print(`Please enter a number between 1 and ${models.length}.`);
      }
    };
  }
}
