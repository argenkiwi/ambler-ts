import { next, Node } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edges<S extends State> = {
  onDone: Node<S>;
};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    utils.print(`Final count: ${state.count}`);
    return next(edges.onDone, state);
  };
}
