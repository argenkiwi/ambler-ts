import { Edges, next } from "../ambler.ts";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S, K extends string = string>(
  edges: Edges<"onDone", K>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    utils.print("Goodbye!");
    return next(edges.onDone, state);
  };
}
