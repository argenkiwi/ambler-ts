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

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils: Utils = defaultUtils,
): (count: number) => Promise<[N | null, number]> =>
async (count: number) => {
  utils.print(`Current count: ${count}`);
  await utils.sleep(1000);
  const nextEdge = utils.random() > 0.5 ? "onCount" : "onStop";
  const nextNumber = count + 1;
  return [edges[nextEdge], nextNumber];
};
