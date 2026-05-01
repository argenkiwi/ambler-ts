import { Next } from "../ambler.ts";
import { saveToFile } from "../utils/save_to_file.ts";

export interface State {
  generatedStory: string;
}

export type Edge = "onSaveComplete";

export type Utils = {
  saveToFile: (content: string) => Promise<boolean>;
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  saveToFile,
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State, N extends string>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
) {
  return async (state: S): Promise<Next<S, N>> => {
    const input = utils.readLine(
      "Would you like to save this story? (y/n): ",
    );
    if (input?.toLowerCase() === "y") {
      const success = await utils.saveToFile(state.generatedStory);
      if (!success) {
        utils.print("Failed to save the story.");
      }
    } else {
      utils.print("Story not saved.");
    }

    return [edges.onSaveComplete, state];
  };
}
