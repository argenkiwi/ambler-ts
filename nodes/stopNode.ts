import { Edges, NodeResult } from "../ambler.ts";

export interface State {
  count: number;
}

export type Hook = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return (state: S): NodeResult<S, K> => {
    utils.print(`Final count: ${state.count}`);
    return [edges.onDone, state];
  };
}
