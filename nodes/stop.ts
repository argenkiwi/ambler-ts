/**
 * Prints the final count value and transitions to the terminal edge.
 *
 * @category counter
 * @reads    count
 * @writes   —
 * @edges    onDone — always
 * @utils    print(msg) — writes a line to stdout
 * @standalone yes
 */
import { NodeFactory } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  utils.print(`Final count: ${state.count}`);
  return [edges.onDone, state];
};
