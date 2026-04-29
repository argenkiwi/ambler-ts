import { Edges, next } from "../ambler.ts";
import { saveFile } from "../utils/story_save.ts";

export interface State {
  selectedModel: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
}

export type Hook = "onSaveComplete";

export type Utils = {
  saveFile: (filename: string, content: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  saveFile,
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    const fullStory = state.storyPages.join("\n\n");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `story-${timestamp}`;

    try {
      await utils.saveFile(filename, fullStory);
      utils.print(`Story saved to cyoa/${filename}.md`);
    } catch (err) {
      utils.print(`Error saving story: ${err}`);
    }

    return next(edges.onSaveComplete, state);
  };
}
