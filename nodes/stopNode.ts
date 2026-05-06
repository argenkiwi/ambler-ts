import { NodeFactory } from "../ambler.ts";

export interface Input {
  count: number;
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<Edge, Utils, Input, void> = (
  edges,
  utils = defaultUtils,
) =>
(input) => {
  utils.print(`Final count: ${input.count}`);
  return [edges.onDone, undefined];
};
