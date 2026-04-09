import { Next, Nextable } from "../ambler.ts";

const KHINSIDER_PREFIX = "https://downloads.khinsider.com/game-soundtracks";

export namespace ReadM3UFileNode {
  export interface State {
    m3uFilePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onHasKhinsider: Nextable<S>;
    onNoKhinsider: Nextable<S>;
  };

  export type Utils = {
    readFile: (path: string) => Promise<string>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    readFile: (path: string) => Deno.readTextFile(path),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const content = await utils.readFile(state.m3uFilePath);
      const urls = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));

      utils.print(`Found ${urls.length} URL(s):`);
      urls.forEach((url) => utils.print(`  ${url}`));

      const nextState = { ...state, urls };
      if (urls.some((url) => url.startsWith(KHINSIDER_PREFIX))) {
        return new Next(edges.onHasKhinsider, nextState);
      }
      return new Next(edges.onNoKhinsider, nextState);
    };
  }
}
