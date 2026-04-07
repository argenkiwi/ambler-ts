import { Nextable } from "../ambler.ts";

export namespace ExitNode {
  export type Utils = {
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
  };

  export function create<S>(
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (_state: S) => {
      utils.print("Goodbye!");
      return null;
    };
  }
}
