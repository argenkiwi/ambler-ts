import { NodeFactory } from "../ambler.ts";

export interface State {
  csv_path: string;
  has_header: boolean;
  header: string[];
  data: string[][];
  new_row?: string[];
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
  readTextFile: (path: string) => string | null;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
  readTextFile: (path) => {
    const content = Deno.readTextFileSync(path);
    return content ?? null;
  },
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (inQuotes) {
      if (char === '"') {
        if (result.length > 0 || current.length > 0) {
          // Check for escaped quote
        }
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const ans = utils.readLine("Does the CSV file have a header row? (yes/no): ");
  if (!ans || !["yes", "no"].includes(ans.toLowerCase())) {
    utils.print("Please answer 'yes' or 'no'.");
    return [edges.onError, state];
  }
  const hasHeader = ans.toLowerCase() === "yes";

  const content = utils.readTextFile(state.csv_path);
  if (content === null) {
    utils.print(`Error: Could not read file "${state.csv_path}".`);
    return [edges.onError, state];
  }

  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  let header: string[] = [];
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const data: string[][] = dataLines.map(parseCSVLine);

  if (hasHeader && lines.length > 0) {
    header = parseCSVLine(lines[0]);
  }

  return [
    edges.onSuccess,
    { ...state, has_header: hasHeader, header, data },
  ];
};
