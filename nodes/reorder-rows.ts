import { NodeFactory } from "../ambler.ts";

export interface State {
  data: string[][];
}

export type Edge = "onComplete" | "onError";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

/**
 * Binary insertion sort with user comparison.
 * Compares row A (new row being inserted) against row B (existing in sorted list).
 *
 * @returns the index at which to insert row A.
 */
function binaryInsert(
  utils: Utils,
  sorted: string[][],
  rowA: string[],
): number {
  let lo = 0;
  let hi = sorted.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const dispA = rowA.join(", ");
    const dispB = sorted[mid].join(", ");

    const answer = utils.readLine(
      `Should "${dispA}" come BEFORE "${dispB}"? (yes/no): `,
    );
    const choice = answer?.trim().toLowerCase();

    if (choice === "yes") {
      hi = mid;
    } else if (choice === "no") {
      lo = mid + 1;
    } else {
      utils.print("Please answer 'yes' or 'no'.");
      continue;
    }
  }

  return lo;
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  if (state.data.length <= 1) {
    utils.print(
      state.data.length === 0
        ? "No rows to reorder."
        : "Only one row — nothing to reorder.",
    );
    return [edges.onComplete, state];
  }

  utils.print("Reordering all rows via pairwise comparisons...\n");

  const sorted: string[][] = [state.data[0]];

  for (let i = 1; i < state.data.length; i++) {
    const row = state.data[i];
    const insertIdx = binaryInsert(utils, sorted, row);
    sorted.splice(insertIdx, 0, row);
  }

  utils.print("\nReordering complete!");
  return [edges.onComplete, { ...state, data: sorted }];
};
