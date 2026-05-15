import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceWalk: string;
  targetDir: string;
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
      utils.print(`Successfully cloned walk "${state.sourceWalk}" to "${state.targetDir}".`);
      if (state.filesToCopy) {
        utils.print("Files copied:");
        state.filesToCopy.forEach((f) => utils.print(`  - ${f}`));
      }
    }
    return [edges.onDone, state];
  };
};
