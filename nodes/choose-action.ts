import { NodeFactory } from "../ambler.ts";

export interface State {
  csv_path: string;
  has_header: boolean;
  header: string[];
  data: string[][];
  new_row?: string[];
}

export type Edge = "add" | "reorder" | "list" | "quit";

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
  utils.print("\n=== Whimsort Menu ===");
  utils.print("  add     - Add a new row and sort it into place");
  utils.print("  reorder - Reorder all existing rows");
  utils.print("  list    - List current rows");
  utils.print("  quit    - Save and exit\n");

  const action = utils.readLine("Choose an action (add/reorder/list/quit): ");
  const choice = action?.trim().toLowerCase();

  if (choice === "add") {
    return [edges.add, state];
  } else if (choice === "reorder") {
    return [edges.reorder, state];
  } else if (choice === "list") {
    return [edges.list, state];
  } else if (choice === "quit") {
    return [edges.quit, state];
  } else {
    utils.print("Unknown action. Please choose add, reorder, list, or quit.");
    return [edges.quit, state];
  }
};
