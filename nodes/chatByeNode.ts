import { Next } from "../ambler.ts";

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S, N extends string>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
) {
  return (state: S): Next<S, N> => {
    utils.print("Goodbye!");
    return [edges.onDone, state];
  };
}
