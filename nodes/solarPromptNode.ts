import { Edges, Next } from "../ambler.ts";

export interface State {
  solarPrompt: string;
}

export type Hook = "onPromptComplete" | "onCancel";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return (state: S): Next<S, K> => {
    utils.print("\n--- Solar Prompt Input ---");
    const promptText = utils.readLine("Enter your solar prompt: ");
    if (promptText === null) return [edges.onCancel, state];

    return [edges.onPromptComplete, { ...state, solarPrompt: promptText }];
  };
}
