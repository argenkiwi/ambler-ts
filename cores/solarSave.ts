import { saveToFile } from "../utils/save_to_file.ts";

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

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils = defaultUtils,
) => {
  return async (generatedStory: string): Promise<[N | null, undefined]> => {
    const userInput = utils.readLine(
      "Would you like to save this story? (y/n): ",
    );
    if (userInput?.toLowerCase() === "y") {
      const success = await utils.saveToFile(generatedStory);
      if (!success) {
        utils.print("Failed to save the story.");
      }
    } else {
      utils.print("Story not saved.");
    }

    return [edges.onSaveComplete, undefined];
  };
};
