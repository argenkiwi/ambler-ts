import { NodeFactory } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onYes";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg: string) => prompt(msg),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  while (true) {
    const input = utils.readLine(
      "Some URLs require resolution. Proceed? (y/n)",
    );

    const answer = (input ?? "").toLowerCase().trim();
    if (answer === "y" || answer === "yes") {
      return [edges.onYes, state];
    }

    if (answer === "n" || answer === "no") {
      return [null, state];
    }

    utils.print("Please enter y or n.");
  }
};
