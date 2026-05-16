import { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  copyFile: (from: string, to: string) => Promise<void>;
  getAmblerSrc: () => string;
};

const defaultUtils: Utils = {
  copyFile: (from, to) => Deno.copyFile(from, to),
  getAmblerSrc: () => new URL("../ambler.ts", import.meta.url).pathname,
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const amblerSrc = utils.getAmblerSrc();
    const targetPath = `${state.targetDir}/ambler.ts`;

    try {
      await utils.copyFile(amblerSrc, targetPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, {
        ...state,
        error: `Failed to copy ambler.ts: ${message}`,
      }];
    }

    return [edges.onSuccess, state];
  };
};
