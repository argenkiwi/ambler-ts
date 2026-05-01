import { NodeFactory } from "../ambler.ts";
import { saveFile } from "../utils/story_save.ts";

export interface State {
  selectedModel: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
}

export type Edge = "onSaveComplete";

export type Utils = {
  saveFile: (filename: string, content: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  saveFile,
  print: (msg) => console.log(msg),
};

export const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const fullStory = state.storyPages.join("\n\n");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `story-${timestamp}`;

    try {
      await utils.saveFile(filename, fullStory);
      utils.print(`Story saved to cyoa/${filename}.md`);
    } catch (err) {
      utils.print(`Error saving story: ${err}`);
    }

    return [edges.onSaveComplete, state];
  };
};
