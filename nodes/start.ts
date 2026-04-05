import { Next, Nextable } from "../ambler.ts";
import { State } from "../state.ts";

const DEFAULT_COUNT = 0;

type StartEdges = {
  onCount: Nextable<State>;
  onInvalid: Nextable<State>;
};

type StartUtils = {
  prompt: (message: string) => Promise<string>;
  print: (message: string) => void;
};

const defaultUtils: StartUtils = {
  prompt: async (message: string): Promise<string> => {
    await Deno.stdout.write(new TextEncoder().encode(message));
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    return n ? new TextDecoder().decode(buf.subarray(0, n)).trimEnd() : "";
  },
  print: (message: string) => console.log(message),
};

export function start(
  edges: StartEdges,
  utils: StartUtils = defaultUtils,
): Nextable<State> {
  return async (state: State): Promise<Next<State> | null> => {
    const input = await utils.prompt("Enter a starting number (or press Enter for default): ");

    if (input === "") {
      return new Next(edges.onCount, { ...state, count: DEFAULT_COUNT });
    }

    const parsed = Number(input);
    if (!Number.isInteger(parsed) || isNaN(parsed)) {
      utils.print(`Invalid input: "${input}". Please enter a valid integer.`);
      return new Next(edges.onInvalid, state);
    }

    return new Next(edges.onCount, { ...state, count: parsed });
  };
}
