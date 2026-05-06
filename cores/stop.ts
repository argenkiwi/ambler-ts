export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils = defaultUtils,
) =>
(count: number): [N | null, number] => {
  utils.print(`Final count: ${count}`);
  return [edges.onDone, count];
};
