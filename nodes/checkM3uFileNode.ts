import { Next, Nextable } from "../ambler.ts";

export namespace CheckM3uFileNode {
  export interface State {
    filePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onValid: Nextable<S>;
    onInvalid: Nextable<S>;
  };

  export type Utils = {
    getArg: () => string | undefined;
    isValidM3uFile: (path: string) => Promise<boolean>;
  };

  const defaultUtils: Utils = {
    getArg: () => Deno.args[0],
    isValidM3uFile: async (path: string) => {
      if (!path.endsWith(".m3u")) return false;
      try {
        const info = await Deno.stat(path);
        return info.isFile;
      } catch {
        return false;
      }
    },
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const path = state.filePath || utils.getArg() || "";
      if (path && await utils.isValidM3uFile(path)) {
        return new Next(edges.onValid, { ...state, filePath: path });
      }
      return new Next(edges.onInvalid, { ...state, filePath: "" });
    };
  }
}
