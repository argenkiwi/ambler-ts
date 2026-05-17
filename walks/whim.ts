import { ambler } from "../ambler.ts";
import { factory as hasHeaderNode } from "../nodes/has-header.ts";
import { factory as listRowsNode } from "../nodes/list-rows.ts";
import { factory as sortRowNode } from "../nodes/sort-row.ts";
import { factory as reorderRowsNode } from "../nodes/reorder-rows.ts";
import { factory as saveFileNode } from "../nodes/save-file.ts";
import { factory as endNode } from "../nodes/end.ts";

export interface State {
  csv_path: string;
  has_header: boolean;
  header: string[];
  data: string[][];
  new_row?: string[];
}

type NodeId =
    | "has_header"
    | "list_rows"
    | "sort_row"
    | "reorder_rows"
    | "save_file"
    | "end";

if (import.meta.main) {
  const args = Deno.args;
  const action = args[0];

  if (!action || !["add", "reorder", "list"].includes(action)) {
    console.log("Usage:");
    console.log(
        "  deno run -A walks/whim.ts add --file <path> --entry '<values>'",
        );
    console.log("  deno run -A walks/whim.ts reorder --file <path>");
    console.log("  deno run -A walks/whim.ts list --file <path>");
    Deno.exit(1);
    }

  const fileIdx = args.indexOf("--file");
  if (fileIdx < 0 || !args[fileIdx + 1]) {
    console.log("Error: --file flag with CSV path is required.");
    Deno.exit(1);
    }
  const csvPath = args[fileIdx + 1];

  let newRow: string[] | undefined = undefined;
  if (action === "add") {
    const entryIdx = args.indexOf("--entry");
    if (entryIdx < 0 || !args[entryIdx + 1]) {
      console.log("Error: --entry flag is required for 'add' action.");
      Deno.exit(1);
      }
    newRow = args[entryIdx + 1].split(",").map((v) => v.trim());
    }

  let data: string[][] = [];
  if (action === "list") {
    const content = Deno.readTextFileSync(csvPath);
    data = content
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .map((line) => line.split(",").map((v) => v.trim()));
    }

  const initialState: State = {
    csv_path: csvPath,
    has_header: false,
    header: [],
    data,
    new_row: newRow,
    };

  const amble = ambler<State, NodeId>({
    has_header: () =>
      hasHeaderNode({
        onSuccess: action === "add" ? "sort_row" : "reorder_rows",
        onError: "has_header",
        }),
    sort_row: () =>
      sortRowNode({
        onComplete: "save_file",
        onError: "end",
        }),
    reorder_rows: () =>
      reorderRowsNode({
        onComplete: "save_file",
        onError: "end",
        }),
    list_rows: () =>
      listRowsNode({
        onComplete: "end",
        }),
    save_file: () =>
      saveFileNode({
        onComplete: "end",
        onError: "end",
        }),
    end: () =>
      endNode({
        onDone: null,
        }),
    });

  let nodeId: NodeId | null = action === "list" ? "list_rows" : "has_header";
  let state: State = initialState;

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
    }
}
