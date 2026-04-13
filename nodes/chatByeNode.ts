import { Nextable } from "../ambler.ts";

export namespace ChatByeNode {
  export interface State {}

  export type Utils = {
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (_state: S): Promise<null> => {
      utils.print("Goodbye!");
      return null;
    };
  }
}
