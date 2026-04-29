import { next } from "../ambler.ts";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export type Edges<K extends string = string> = {
  onDone: K | null;
};

export function create<S, K extends string = string>(
  edges: Edges<K>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    utils.print("Goodbye!");
    return next(edges.onDone, state);
  };
}
