import { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  filesToCopy: string[];
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  copyFile: (src: string, dest: string) => Promise<void>;
  mkdir: (path: string, options?: Deno.MkdirOptions) => Promise<void>;
};

const defaultUtils: Utils = {
  copyFile: (src, dest) => Deno.copyFile(src, dest),
  mkdir: (path, options) => Deno.mkdir(path, options),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const { targetDir, filesToCopy } = state;

    if (!filesToCopy || filesToCopy.length === 0) {
      return [edges.onSuccess, state];
    }

    try {
      const normalizedTargetDir = targetDir.endsWith("/")
        ? targetDir.slice(0, -1)
        : targetDir;

      for (const file of filesToCopy) {
        const dest = `${normalizedTargetDir}/${file}`;

        // Ensure parent directory exists
        const lastSlash = dest.lastIndexOf("/");
        if (lastSlash !== -1) {
          const parentDir = dest.substring(0, lastSlash);
          await utils.mkdir(parentDir, { recursive: true });
        }

        await utils.copyFile(file, dest);
      }

      return [edges.onSuccess, state];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, {
        ...state,
        error: `Failed to copy files: ${message}`,
      }];
    }
  };
};
