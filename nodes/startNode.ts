import { defaultPrint, defaultReadLine, next, Nextable } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edges<S extends State> = {
  onSuccess: Nextable<S>;
  onError: Nextable<S>;
};

export type Utils = {
  readLine: (msg: string) => Promise<string | null>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: defaultReadLine,
  print: defaultPrint,
};

export const create =
  <S extends State>(edges: Edges<S>, utils: Utils = defaultUtils) =>
  async (state: S) => {
    const input = await utils.readLine("Enter a starting number: ");

    if (input === null || input === "") {
      return next(edges.onSuccess, { ...state, count: 0 });
    }

    const n = parseInt(input);
    if (isNaN(n)) {
      utils.print("Error: Invalid input. Please enter a number.");
      return next(edges.onError, state);
    }

    return next(edges.onSuccess, { ...state, count: n });
  };
