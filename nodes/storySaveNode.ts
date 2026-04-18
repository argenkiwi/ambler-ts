import { next, Nextable, defaultPrint } from "../ambler.ts";
import fs from "node:fs/promises";

export interface State {
  selectedModel: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
}

export type Edges<S extends State> = {
  onSaveComplete: Nextable<S>;
};

export type Utils = {
  saveFile: (filename: string, content: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  saveFile: async (filename, content) => {
    const dir = "cyoa";
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${filename}.md`, content);
  },
  print: defaultPrint,
};

export const create = <S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Nextable<S> =>
async (state: S) => {
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
