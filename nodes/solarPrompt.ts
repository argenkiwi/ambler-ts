import { NodeFactory } from "../ambler.ts";

export interface State {
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

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  utils.print("\n--- Solar Prompt Input ---");
  const promptText = utils.readLine("Enter your solar prompt: ");
  if (promptText === null) return [edges.onCancel, state];

  return [edges.onPromptComplete, { ...state, solarPrompt: promptText }];
};
