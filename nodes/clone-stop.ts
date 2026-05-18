import { NodeFactory } from "../ambler.ts";

export interface State {
  walkName: string;
  targetDir: string;
  artifactType?: "walk" | "node" | "util";
  filesToCopy?: string[];
  error?: string;
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
) => {
  return (state) => {
    if (state.error) {
      utils.print(`Error: ${state.error}`);
    } else {
      const type = state.artifactType ?? "walk";
      utils.print(
        `Successfully cloned ${type} "${state.walkName}" to "${state.targetDir}".`,
      );
      if (state.filesToCopy) {
        utils.print("Files copied:");
        state.filesToCopy.forEach((f) => utils.print(`  - ${f}`));
      }
    }
    return [edges.onDone, state];
  };
};
