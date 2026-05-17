import { NodeFactory } from "../ambler.ts";

export interface State {
  csv_path: string;
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
  const path = utils.readLine("Enter the path to the CSV file: ");
  if (path === null || path.trim() === "") {
    utils.print("Error: Path is required.");
    return [edges.onError, state];
  }
  return [edges.onSuccess, { ...state, csv_path: path.trim() }];
};
