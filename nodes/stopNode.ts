import { Nextable } from "../ambler.ts";

export namespace StopNode {
  export interface State {
    count: number;
  }

  export type Utils = {
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<null> => {
      utils.print(`Final count: ${state.count}`);
      return null;
    };
  }
}
