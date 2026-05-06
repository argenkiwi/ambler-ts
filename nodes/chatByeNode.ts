import { NodeFactory } from "../ambler.ts";

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<Edge, Utils, void, void> = (
  edges,
  utils = defaultUtils,
) => {
  return () => {
    utils.print("Goodbye!");
    return [edges.onDone, undefined];
  };
};
