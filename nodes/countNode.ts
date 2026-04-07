import { Next, Nextable } from "../ambler.ts";

export namespace CountNode {
  export interface State {
    count: number;
  }

  export type Edges<S extends State> = {
    onCount: Nextable<S>;
    onStop: Nextable<S>;
  };

  export type Utils = {
    print: (msg: string) => void;
    sleep: (ms: number) => Promise<void>;
    random: () => number;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
    sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    random: () => Math.random(),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      utils.print(`Current count: ${state.count}`);
      await utils.sleep(1000);
      const nextState = { ...state, count: state.count + 1 };
      
      if (utils.random() > 0.5) {
        return new Next(edges.onCount, nextState);
      } else {
        return new Next(edges.onStop, nextState);
      }
    };
  }
}
