import { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  writeTextFile: (path: string, data: string) => Promise<void>;
};

const defaultUtils: Utils = {
  writeTextFile: (path, data) => Deno.writeTextFile(path, data),
};

const DENO_JSON = `{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.19"
  }
}
`;

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const targetPath = `${state.targetDir}/deno.json`;

    try {
      await utils.writeTextFile(targetPath, DENO_JSON);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, {
        ...state,
        error: `Failed to write deno.json: ${message}`,
      }];
    }

    return [edges.onSuccess, state];
  };
};
