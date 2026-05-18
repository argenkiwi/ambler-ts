/**
 * Increments a numeric counter by 1 and randomly transitions to continue or stop.
 *
 * @category counter
 * @reads    count
 * @writes   count
 * @edges    onCount — random() > 0.5, keep counting
 *           onStop — random() <= 0.5, stop the walk
 * @utils    print(msg) — writes a line to stdout
 *           sleep(ms) — async delay
 *           random() — random number source
 * @standalone yes
 */
import { NodeFactory } from "../ambler.ts";

export interface State {
  count: number;
}

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

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  utils.print(`Current count: ${state.count}`);
  await utils.sleep(1000);
  const nextState = { ...state, count: state.count + 1 };

  if (utils.random() > 0.5) {
    return [edges.onCount, nextState];
  } else {
    return [edges.onStop, nextState];
  }
};
