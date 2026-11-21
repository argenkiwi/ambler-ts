import type { MakeDirectoryOptions } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import type { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  mkdir: (path: string, options?: MakeDirectoryOptions) => Promise<void>;
  /** Rejects if `path` does not exist. */
  stat: (path: string) => Promise<{ isDirectory: boolean }>;
};

const defaultUtils: Utils = {
  mkdir: async (path, options) => {
    await mkdir(path, options);
  },
  // Node's Stats.isDirectory is a method; adapt it to a plain boolean.
  stat: async (path) => ({ isDirectory: (await stat(path)).isDirectory() }),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const { targetDir } = state;

    if (!targetDir) {
      return [
        edges.onError,
        {
          ...state,
          error: "No target directory provided.",
        },
      ];
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
      `${targetDir}/walks`,
      `${targetDir}/specs`,
      `${targetDir}/utils`,
      `${targetDir}/nodes/tests`,
    ];

    try {
      for (const dir of dirs) {
        await utils.mkdir(dir, { recursive: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [
        edges.onError,
        {
          ...state,
          error: `Failed to create directories: ${message}`,
        },
      ];
    }

    return [edges.onSuccess, state];
  };
};
