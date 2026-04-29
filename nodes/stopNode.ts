import { next } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edges<K extends string = string> = {
  onDone: K | null;
};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<K>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    utils.print(`Final count: ${state.count}`);
    return next(edges.onDone, state);
  };
}
