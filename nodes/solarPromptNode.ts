import { defaultPrint, defaultReadLine, next, Nextable } from "../ambler.ts";

export interface State {
  solarPrompt: string;
}

export type Edges<S extends State> = {
  onPromptComplete: Nextable<S>;
};

export type Utils = {
  readLine: (msg: string) => Promise<string | null>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: defaultReadLine,
  print: defaultPrint,
};

export function create<S extends State>(edges: Edges<S>, utils: Utils = defaultUtils) {
  return async (state: S) => {
    utils.print("\n--- Solar Prompt Input ---");
    const promptText = await utils.readLine("Enter your solar prompt: ");
    if (promptText === null) return null;

    return next(edges.onPromptComplete, { ...state, solarPrompt: promptText });
  };
}
