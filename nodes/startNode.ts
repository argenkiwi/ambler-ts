import { Edges, next } from "../ambler.ts";

export interface State {
  count: number;
}

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<"onSuccess" | "onError", K>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    const input = utils.readLine("Enter a starting number: ");

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
}
