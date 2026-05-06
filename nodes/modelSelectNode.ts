import { NodeFactory } from "../ambler.ts";
import { listModels } from "../utils/ollama_models.ts";

export interface Input {
  ollamaHost: string;
}

export interface Output {
  selectedModel: string;
}

export type Edge = "onSelect" | "onCancel";

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

export const factory: NodeFactory<Edge, Utils, Input, Output> = (
  edges,
  utils = defaultUtils,
) =>
async (input) => {
  const models = await utils.listModels(input.ollamaHost);
  utils.print("Available models:");
  models.forEach((m, i) => utils.print(`${i}: ${m}`));

  const userInput = utils.readLine("Select model index: ");
  if (userInput === null) return [edges.onCancel, { selectedModel: "" }];

  const index = parseInt(userInput);
  if (isNaN(index) || index < 0 || index >= models.length) {
    utils.print("Invalid selection.");
    return [edges.onSelect, { selectedModel: "" }];
  }

  utils.print(`Selected model: ${models[index]}`);
  return [edges.onSelect, { selectedModel: models[index] }];
};
