import { listModels } from "../utils/ollama_models.ts";

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

export const factory = <N extends string | null>(
  edges: Record<Edge, N>,
  utils = defaultUtils,
) =>
async (ollamaHost: string): Promise<[N, string]> => {
  const models = await utils.listModels(ollamaHost);
  utils.print("Available models:");
  models.forEach((m, i) => utils.print(`${i}: ${m}`));

  const userInput = utils.readLine("Select model index: ");
  if (userInput === null) return [edges.onCancel, ""];

  const index = parseInt(userInput);
  if (isNaN(index) || index < 0 || index >= models.length) {
    utils.print("Invalid selection.");
    return [edges.onSelect, ""];
  }

  utils.print(`Selected model: ${models[index]}`);
  return [edges.onSelect, models[index]];
};
