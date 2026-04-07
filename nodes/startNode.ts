import { Next, Nextable } from "../ambler.ts";

export namespace StartNode {
  export interface State {
    count: number;
  }

  export type Edges<S extends State> = {
    onSuccess: Nextable<S>;
    onError: Nextable<S>;
  };

  export type Utils = {
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const input = await utils.readLine("Enter a starting number: ");
      
      if (input === null || input === "") {
        return new Next(edges.onSuccess, { ...state, count: 0 });
      }

      const n = parseInt(input);
      if (isNaN(n)) {
        utils.print("Error: Invalid input. Please enter a number.");
        return new Next(edges.onError, state);
      }

      return new Next(edges.onSuccess, { ...state, count: n });
    };
  }
}
