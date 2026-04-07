import { Next, Nextable } from "../ambler.ts";

export namespace ListUrlsNode {
  export interface State {
    urls: string[];
  }

  export type Edges<S extends State> = {
    onDone: Nextable<S>;
  };

  export type Utils = {
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      for (const url of state.urls) {
        utils.print(url);
      }
      return new Next(edges.onDone, state);
    };
  }
}
