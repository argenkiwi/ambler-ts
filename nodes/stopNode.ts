import { defaultPrint } from "../ambler.ts";

export interface State {
  count: number;
}

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: defaultPrint,
};

export const create =
  (utils: Utils = defaultUtils) => async <S extends State>(state: S) => {
    utils.print(`Final count: ${state.count}`);
    return null;
  };
