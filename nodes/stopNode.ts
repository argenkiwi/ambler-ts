import { Nextable, defaultPrint } from "../ambler.ts";

export interface State {
  count: number;
}

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: defaultPrint,
};

export function create<S extends State>(
  utils: Utils = defaultUtils,
): Nextable<S> {
  return async (state: S) => {
    utils.print(`Final count: ${state.count}`);
    return null;
  };
}
