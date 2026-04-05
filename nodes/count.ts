import { Next, Nextable } from "../ambler.ts";
import { State } from "../state.ts";

type CountEdges = {
  onCount: Nextable<State>;
  onStop: Nextable<State>;
};

type CountUtils = {
  print: (message: string) => void;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
};

const defaultUtils: CountUtils = {
  print: (message: string) => console.log(message),
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  random: () => Math.random(),
};

export function count(
  edges: CountEdges,
  utils: CountUtils = defaultUtils,
): Nextable<State> {
  return async (state: State): Promise<Next<State> | null> => {
    utils.print(`Count: ${state.count}`);
    await utils.sleep(1000);

    const nextState: State = { ...state, count: state.count + 1 };

    if (utils.random() < 0.5) {
      return new Next(edges.onStop, nextState);
    }
    return new Next(edges.onCount, nextState);
  };
}
