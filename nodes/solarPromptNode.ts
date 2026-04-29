import { next } from "../ambler.ts";

export interface State {
  solarPrompt: string;
}

export type Edges<K extends string = string> = {
  onPromptComplete: K | null;
  onCancel: K | null;
};

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<K>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    utils.print("\n--- Solar Prompt Input ---");
    const promptText = utils.readLine("Enter your solar prompt: ");
    if (promptText === null) return next(edges.onCancel, state);

    return next(edges.onPromptComplete, { ...state, solarPrompt: promptText });
  };
}
