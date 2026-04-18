import { Nextable, defaultPrint } from "../ambler.ts";

export interface State {}

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: defaultPrint,
};

export const create = <S extends State>(
  utils: Utils = defaultUtils,
): Nextable<S> =>
async (_state: S) => {
  utils.print("Goodbye!");
  return null;
};
