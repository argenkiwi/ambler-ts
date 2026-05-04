import { NodeFactory } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const input = utils.readLine("Enter a starting number: ");

    if (input === null || input === "") {
      return [edges.onSuccess, { ...state, count: 0 }];
    }

    const n = parseInt(input);
    if (isNaN(n)) {
      utils.print("Error: Invalid input. Please enter a number.");
      return [edges.onError, state];
    }

    return [edges.onSuccess, { ...state, count: n }];
  };
};
