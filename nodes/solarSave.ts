import { NodeFactory } from "../ambler.ts";
import { saveToFile } from "../utils/save_to_file.ts";

export interface State {
  generatedStory: string;
}

export type Edge = "onSaveComplete";

export type Utils = {
  saveToFile: (content: string) => Promise<string>;
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  saveToFile,
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const input = utils.readLine(
    "Would you like to save this story? (y/n): ",
  );
  if (input?.toLowerCase() === "y") {
    try {
      const filename = await utils.saveToFile(state.generatedStory);
      utils.print(`Saved to ${filename}`);
    } catch (err) {
      utils.print(`Failed to save the story: ${err}`);
    }
  } else {
    utils.print("Story not saved.");
  }

  return [edges.onSaveComplete, state];
};
