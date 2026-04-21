import { next, Nextable } from "../ambler.ts";

export interface State {
  solarPrompt: string;
}

export type Edges<S extends State> = {
  onPromptComplete: Nextable<S>;
};

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    utils.print("\n--- Solar Prompt Input ---");
    const promptText = utils.readLine("Enter your solar prompt: ");
    if (promptText === null) return null;

    return next(edges.onPromptComplete, { ...state, solarPrompt: promptText });
  };
}
