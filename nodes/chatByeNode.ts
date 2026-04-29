import { Edges, NodeResult } from "../ambler.ts";

export type Hook = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return (state: S): NodeResult<S, K> => {
    utils.print("Goodbye!");
    return [edges.onDone, state];
  };
}
