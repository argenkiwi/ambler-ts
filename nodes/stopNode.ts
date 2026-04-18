import { defaultPrint, Nextable } from "../ambler.ts";

export interface State {
  count: number;
}

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: defaultPrint,
};

export const create = <S extends State>(
  utils: Utils = defaultUtils,
): Nextable<S> =>
async (state: S) => {
  utils.print(`Final count: ${state.count}`);
  return null;
};
