import { NodeFactory } from "../ambler.ts";

export interface State {
  data: string[][];
  new_row?: string[];
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

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const input = utils.readLine(
    "Enter the new row as comma-separated values: ",
  );
  if (input === null || input.trim() === "") {
    utils.print("Error: Row content is required.");
    return [edges.onError, state];
  }

  const newRow = input.split(",").map((v) => v.trim());
  return [
    edges.onSuccess,
    { ...state, new_row: newRow },
  ];
};
