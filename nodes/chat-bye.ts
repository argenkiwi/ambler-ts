import { NodeFactory } from "../ambler.ts";

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<object, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    utils.print("Goodbye!");
    return [edges.onDone, state];
  };
};
