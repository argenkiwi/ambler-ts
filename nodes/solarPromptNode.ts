import { Next } from "../ambler.ts";

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

export function create<S extends State, N extends string>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
) {
  return (state: S): Next<S, N> => {
    utils.print("\n--- Solar Prompt Input ---");
    const promptText = utils.readLine("Enter your solar prompt: ");
    if (promptText === null) return [edges.onCancel, state];

    return [edges.onPromptComplete, { ...state, solarPrompt: promptText }];
  };
}
