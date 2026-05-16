import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceWalk: string;
  targetDir: string;
  isNewProject?: boolean;
  error?: string;
}

export type Edge = "onNewProject" | "onExisting" | "onError";

export type Utils = {
  exists: (path: string) => Promise<boolean>;
};

const defaultUtils: Utils = {
  exists: async (path) => {
    try {
      await Deno.stat(path);
      return true;
    } catch {
      return false;
    }
  },
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const { sourceWalk, targetDir } = state;

    if (!sourceWalk) {
      return [edges.onError, { ...state, error: "No source walk provided." }];
    }

    if (!targetDir) {
      return [edges.onError, { ...state, error: "No target directory provided." }];
    }

    // Check if source walk exists
    const sourcePath = `walks/${sourceWalk}.ts`;
    if (!(await utils.exists(sourcePath))) {
      return [
        edges.onError,
        { ...state, error: `Source walk "${sourceWalk}" not found at ${sourcePath}.` },
      ];
    }

    // Check if target directory is an Ambler project
    const isAmblerProject = await utils.exists(`${targetDir}/ambler.ts`);
    const isDenoProject = await utils.exists(`${targetDir}/deno.json`);

    const isNewProject = !(isAmblerProject && isDenoProject);

    return [isNewProject ? edges.onNewProject : edges.onExisting, { ...state, isNewProject }];
  };
};
