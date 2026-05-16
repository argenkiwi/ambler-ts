import { NodeFactory } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  args: () => string[];
  stat: (path: string) => Promise<Deno.FileInfo>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  args: () => Deno.args,
  stat: (path: string) => Deno.stat(path),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const filePath = utils.args()[0];

  if (!filePath) {
    utils.print("Error: No M3U file path provided.");
    return [null, state];
  }

  if (!filePath.endsWith(".m3u")) {
    utils.print(`Error: File must have .m3u extension: ${filePath}`);
    return [null, state];
  }

  try {
    const info = await utils.stat(filePath);
    if (!info.isFile) {
      utils.print(`Error: Path is not a file: ${filePath}`);
      return [null, state];
    }
  } catch {
    utils.print(`Error: File not found: ${filePath}`);
    return [null, state];
  }

  return [edges.onSuccess, { ...state, m3uFilePath: filePath }];
};
