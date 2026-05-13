import { NodeFactory } from "../ambler.ts";

export interface State {
  story_pages: string[];
}

export type Edge = "onDone";

export type Utils = {
  writeFile: (path: string, content: string) => Promise<void>;
  createDir: (path: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  writeFile: (path, content) => Deno.writeTextFile(path, content),
  createDir: (path) => Deno.mkdir(path, { recursive: true }),
  print: (msg) => console.log(msg),
};

function buildTimestamp(): string {
  const d = new Date();
  return d.getFullYear().toString()
    + (d.getMonth() + 1).toString().padStart(2, "0")
    + d.getDate().toString().padStart(2, "0")
    + "-"
    + d.getHours().toString().padStart(2, "0")
    + d.getMinutes().toString().padStart(2, "0")
    + d.getSeconds().toString().padStart(2, "0");
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const timestamp = buildTimestamp();
    const filename = `cyoa/${timestamp}.md`;
    const content = state.story_pages.join("\n\n---\n\n");

    try {
      await utils.createDir("cyoa");
      await utils.writeFile(filename, content);
      utils.print(`\nStory saved to ${filename}`);
    } catch (err) {
      utils.print(`Error saving story: ${err instanceof Error ? err.message : String(err)}`);
    }

    return [edges.onDone, state];
  };
};
