import { NodeFactory } from "../ambler.ts";

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

const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    utils.print(`Final count: ${state.count}`);
    return [edges.onDone, state];
  };
};

export default create;