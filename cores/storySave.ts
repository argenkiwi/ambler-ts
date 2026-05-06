import { saveFile } from "../utils/story_save.ts";

export type Edge = "onSaveComplete";

export type Utils = {
  saveFile: (filename: string, content: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  saveFile,
  print: (msg) => console.log(msg),
};

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils = defaultUtils,
) =>
async (storyPages: string[]): Promise<[N | null, undefined]> => {
  const fullStory = storyPages.join("\n\n");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `story-${timestamp}`;

  try {
    await utils.saveFile(filename, fullStory);
    utils.print(`Story saved to cyoa/${filename}.md`);
  } catch (err) {
    utils.print(`Error saving story: ${err}`);
  }

  return [edges.onSaveComplete, undefined];
};
