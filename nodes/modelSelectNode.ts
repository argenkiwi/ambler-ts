import { Edges, next } from "../ambler.ts";
import { listModels } from "../utils/ollama_models.ts";

export interface State {
  selectedModel: string;
  ollamaHost: string;
}

export type Utils = {
  listModels: (host: string) => Promise<string[]>;
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  listModels,
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<"onSelect" | "onCancel", K>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    const models = await utils.listModels(state.ollamaHost);
    utils.print("Available models:");
    models.forEach((m, i) => utils.print(`${i}: ${m}`));

    const input = utils.readLine("Select model index: ");
    if (input === null) return next(edges.onCancel, state);

    const index = parseInt(input);
    if (isNaN(index) || index < 0 || index >= models.length) {
      utils.print("Invalid selection.");
      return next(edges.onSelect, state);
    }

    utils.print(`Selected model: ${models[index]}`);
    return next(edges.onSelect, { ...state, selectedModel: models[index] });
  };
}
