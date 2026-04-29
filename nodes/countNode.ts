import { Edges, NodeResult } from "../ambler.ts";

export interface State {
  count: number;
}

export type Hook = "onCount" | "onStop";

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

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return async (state: S): Promise<NodeResult<S, K>> => {
    utils.print(`Current count: ${state.count}`);
    await utils.sleep(1000);
    const nextState = { ...state, count: state.count + 1 };

    if (utils.random() > 0.5) {
      return [edges.onCount, nextState];
    } else {
      return [edges.onStop, nextState];
    }
  };
}
