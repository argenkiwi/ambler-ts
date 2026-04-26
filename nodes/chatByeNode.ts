import { next, Node } from "../ambler.ts";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export type Edges<S> = {
  onDone: Node<S>;
};

export function create<S>(edges: Edges<S>, utils: Utils = defaultUtils) {
  return (state: S) => {
    utils.print("Goodbye!");
    return next(edges.onDone, state);
  };
}
