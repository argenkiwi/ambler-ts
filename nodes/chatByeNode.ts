import { defaultPrint } from "../ambler.ts";

export interface State {}

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: defaultPrint,
};

export function create<S extends State>(utils: Utils = defaultUtils) {
  return async (_state: S) => {
    utils.print("Goodbye!");
    return null;
  };
}
