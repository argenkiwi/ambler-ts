import { NodeFactory } from "../ambler.ts";
import { listModels } from "../utils/ollama_chat.ts";
import { getPrompt } from "../utils/prompt.ts";

export interface State {
  host: string;
  model: string;
}

export type Edge = "onSuccess";

export type Utils = {
  listModels: (host: string) => Promise<string[]>;
  getPrompt: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  listModels,
  getPrompt,
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const models = await utils.listModels(state.host);

    if (models.length === 0) {
      utils.print(
        "No models found in Ollama. Please pull a model first (e.g. 'ollama pull llama3').",
      );
      const manualModel = utils.getPrompt("Enter model name manually: ");
      return [edges.onSuccess, { ...state, model: manualModel || "" }];
    }

    utils.print("Available models:");
    models.forEach((m, i) => utils.print(`${i + 1}. ${m}`));

    const choice = utils.getPrompt(`Select a model (1-${models.length}) [1]: `);
    const index = choice ? parseInt(choice) - 1 : 0;
    const selectedModel = models[index] || models[0];

    utils.print(`Selected model: ${selectedModel}`);

    return [edges.onSuccess, { ...state, model: selectedModel }];
  };
};
