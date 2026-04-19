import { defaultPrint } from "../utils/defaultPrint.ts";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: defaultPrint,
};

export function create<S>(utils: Utils = defaultUtils) {
  return (_state: S) => {
    utils.print("Goodbye!");
    return null;
  };
}
