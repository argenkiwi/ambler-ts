import { NodeFactory } from "../ambler.ts";

export interface State {
  csv_path: string;
  has_header: boolean;
  header: string[];
  data: string[][];
}

export type Edge = "onComplete" | "onError";

export type Utils = {
  print: (msg: string) => void;
  writeTextFile: (path: string, content: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  writeTextFile: (path, content) => {
    Deno.writeTextFileSync(path, content);
  },
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const lines: string[] = [];

  if (state.has_header && state.header.length > 0) {
    lines.push(state.header.join(","));
  }

  state.data.forEach((row) => {
    lines.push(row.join(","));
  });

  try {
    utils.writeTextFile(state.csv_path, lines.join("\n") + "\n");
    utils.print(`File saved to "${state.csv_path}".`);
    return [edges.onComplete, state];
  } catch (err) {
    utils.print(`Error saving file: ${err}`);
    return [edges.onError, state];
  }
};
