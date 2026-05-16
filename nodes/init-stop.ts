import { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
  exit: (code?: number) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  exit: (code) => Deno.exit(code),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    if (state.error) {
      utils.print(`Error: ${state.error}`);
      utils.exit(1);
    } else {
      utils.print(`Initializing ambler project in "${state.targetDir}"...`);
      utils.print(`  Created: ambler.ts (copied)`);
      utils.print(`  Created: deno.json`);
      utils.print(
        `\nDone! Run "deno check ${state.targetDir}/ambler.ts" to verify.`,
      );
    }
    return [edges.onDone, state];
  };
};
