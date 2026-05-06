import { NodeFactory } from "../ambler.ts";

export interface Output {
  solarPrompt: string;
}

export type Edge = "onPromptComplete" | "onCancel";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<Edge, Utils, void, Output> = (
  edges,
  utils = defaultUtils,
) => {
  return () => {
    utils.print("\n--- Solar Prompt Input ---");
    const promptText = utils.readLine("Enter your solar prompt: ");
    if (promptText === null) return [edges.onCancel, { solarPrompt: "" }];

    return [edges.onPromptComplete, { solarPrompt: promptText }];
  };
};
