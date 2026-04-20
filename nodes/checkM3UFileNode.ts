import { next, Nextable } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edges<S extends State> = {
  onSuccess: Nextable<S>;
};

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

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    const filePath = utils.args()[0];

    if (!filePath) {
      utils.print("Error: No M3U file path provided.");
      return null;
    }

    if (!filePath.endsWith(".m3u")) {
      utils.print(`Error: File must have .m3u extension: ${filePath}`);
      return null;
    }

    try {
      const info = await utils.stat(filePath);
      if (!info.isFile) {
        utils.print(`Error: Path is not a file: ${filePath}`);
        return null;
      }
    } catch {
      utils.print(`Error: File not found: ${filePath}`);
      return null;
    }

    return next(edges.onSuccess, { ...state, m3uFilePath: filePath });
  };
}
