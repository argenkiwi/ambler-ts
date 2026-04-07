import { Next, Nextable } from "../ambler.ts";

export namespace PromptM3uFileNode {
  export interface State {
    filePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onEntered: Nextable<S>;
  };

  export type Utils = {
    readLine: (msg: string) => Promise<string | null>;
  };

  const defaultUtils: Utils = {
    readLine: async (msg: string) => prompt(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const input = await utils.readLine("Enter path to M3U file (or press Enter to quit): ");
      if (!input) return null;
      return new Next(edges.onEntered, { ...state, filePath: input });
    };
  }
}
