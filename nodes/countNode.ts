import { NodeFactory } from "../ambler.ts";

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

export const factory: NodeFactory<Edge, Utils, number, number> = (
  edges,
  utils = defaultUtils,
) =>
async (count: number) => {
  utils.print(`Current count: ${count}`);
  await utils.sleep(1000);
  return [utils.random() > 0.5 ? edges.onCount : edges.onStop, count + 1];
};
