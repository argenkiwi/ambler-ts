import { Nextable } from "../ambler.ts";
import { State } from "../state.ts";

type StopUtils = {
  print: (message: string) => void;
};

const defaultUtils: StopUtils = {
  print: (message: string) => console.log(message),
};

export function stop(
  utils: StopUtils = defaultUtils,
): Nextable<State> {
  return async (state: State): Promise<null> => {
    utils.print(`Final count: ${state.count}`);
    return null;
  };
}
