import { NodeFactory } from "../ambler.ts";

export interface State {
  data: string[][];
  new_row?: string[];
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
 * Compares the new row (A) against rows in the sorted list (B).
 * The user is asked "Should A come before B?" and answers yes/no.
 *
 * @returns the index at which to insert the new row.
 */
function binaryInsert(
  utils: Utils,
  sorted: string[][],
  newRow: string[],
): number {
  let lo = 0;
  let hi = sorted.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const rowA = newRow.join(", ");
    const rowB = sorted[mid].join(", ");

    const answer = utils.readLine(
      `Should "${rowA}" come BEFORE "${rowB}"? (yes/no): `,
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
  const newRow = state.new_row;
  if (!newRow) {
    utils.print("Error: No new row to sort.");
    return [edges.onError, state];
  }

  const sortedData = [...state.data];
  if (sortedData.length === 0) {
    sortedData.push(newRow);
    utils.print("No existing rows. The new row was appended.");
  } else {
    const insertIdx = binaryInsert(utils, sortedData, newRow);
    sortedData.splice(insertIdx, 0, newRow);
    utils.print(
      `Inserted at position ${insertIdx + 1} of ${sortedData.length}.`,
    );
  }

  return [
    edges.onComplete,
    { ...state, data: sortedData, new_row: undefined },
  ];
};
