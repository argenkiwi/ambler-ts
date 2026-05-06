import { Node, NodeFactory } from "../ambler.ts";

export type Edge = "onCount" | "onStop";

export type Utils = {
  print: (msg: string) => void;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  random: () => Math.random(),
};

export const factory: NodeFactory<Edge, Utils, number> = <
  N extends string,
  S extends number,
>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
): Node<S, N> =>
async (count: S) => {
  utils.print(`Current count: ${count}`);
  await utils.sleep(1000);
  const nextEdge = utils.random() > 0.5 ? "onCount" : "onStop";
  const nextNumber = (count + 1) as unknown as S;
  return [edges[nextEdge], nextNumber];
};
