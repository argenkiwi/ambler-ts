import { Next, Nextable } from "../ambler.ts";

export namespace SaveM3uFileNode {
  export interface State {
    filePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onSaved: Nextable<S>;
  };

  export type Utils = {
    writeFile: (path: string, content: string) => Promise<void>;
  };

  const defaultUtils: Utils = {
    writeFile: (path: string, content: string) => Deno.writeTextFile(path, content),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      await utils.writeFile(state.filePath, state.urls.join("\n"));
      return new Next(edges.onSaved, state);
    };
  }
}
