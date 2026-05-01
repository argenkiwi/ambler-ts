import { NodeFactory } from "../ambler.ts";
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

export const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
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
};
