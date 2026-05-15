import { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  mkdir: (path: string, options?: Deno.MkdirOptions) => Promise<void>;
  stat: (path: string) => Promise<Deno.FileInfo>;
};

const defaultUtils: Utils = {
  mkdir: (path, options) => Deno.mkdir(path, options),
  stat: (path) => Deno.stat(path),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const { targetDir } = state;

    if (!targetDir) {
      return [edges.onError, { ...state, error: "No target directory provided." }];
    }

    // Validate target directory
    try {
      const stat = await utils.stat(targetDir);
      if (!stat.isDirectory) {
        return [
          edges.onError,
          { ...state, error: `"${targetDir}" exists and is not a directory.` },
        ];
      }
    } catch {
      // Does not exist — will be created
    }

    // Create directory structure
    const dirs = [
      targetDir,
      `${targetDir}/cores/tests`,
      `${targetDir}/walks`,
      `${targetDir}/specs`,
      `${targetDir}/utils`,
    ];

    try {
      for (const dir of dirs) {
        await utils.mkdir(dir, { recursive: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, { ...state, error: `Failed to create directories: ${message}` }];
    }

    return [edges.onSuccess, state];
  };
};
