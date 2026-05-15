import { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  isNewProject?: boolean;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  mkdir: (path: string, options?: Deno.MkdirOptions) => Promise<void>;
  copyFile: (src: string, dest: string) => Promise<void>;
};

const defaultUtils: Utils = {
  mkdir: (path, options) => Deno.mkdir(path, options),
  copyFile: (src, dest) => Deno.copyFile(src, dest),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    if (!state.isNewProject) {
      return [edges.onSuccess, state];
    }

    const { targetDir } = state;

    // Create directory structure
    const dirs = [
      targetDir,
      `${targetDir}/walks`,
      `${targetDir}/specs`,
      `${targetDir}/nodes/tests`,
      `${targetDir}/utils`,
    ];

    try {
      for (const dir of dirs) {
        await utils.mkdir(dir, { recursive: true });
      }

      // Copy core files
      await utils.copyFile("ambler.ts", `${targetDir}/ambler.ts`);
      await utils.copyFile("deno.json", `${targetDir}/deno.json`);

      return [edges.onSuccess, state];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, { ...state, error: `Failed to initialize target: ${message}` }];
    }
  };
};
