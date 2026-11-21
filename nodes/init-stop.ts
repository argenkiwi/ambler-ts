import type { NodeFactory } from "../ambler.ts";

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
  exit: (code) => process.exit(code),
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
      utils.print(`  Created: package.json`);
      utils.print(`  Created: tsconfig.json`);
      utils.print(
        `\nDone! Run "cd ${state.targetDir} && bun install && bunx tsc --noEmit" to verify.`,
      );
    }
    return [edges.onDone, state];
  };
};
