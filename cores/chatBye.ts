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
) => {
  return (): [N | null, undefined] => {
    utils.print("Goodbye!");
    return [edges.onDone, undefined];
  };
};
