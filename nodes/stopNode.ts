import { Next } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S extends State, N extends string>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
) {
  return (state: S): Next<S, N> => {
    utils.print(`Final count: ${state.count}`);
    return [edges.onDone, state];
  };
}
