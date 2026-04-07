import { Next, Nextable } from "../ambler.ts";

export namespace ReadM3uFileNode {
  export interface State {
    filePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onRead: Nextable<S>;
  };

  export type Utils = {
    readFile: (path: string) => Promise<string>;
  };

  const defaultUtils: Utils = {
    readFile: (path: string) => Deno.readTextFile(path),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const content = await utils.readFile(state.filePath);
      const urls = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
      return new Next(edges.onRead, { ...state, urls });
    };
  }
}
