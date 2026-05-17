import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceWalkPath: string;
  targetDir: string;
  sourceRoot?: string;
  walkName?: string;
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

function parseWalkPath(walkPath: string): { sourceRoot: string; walkName: string } {
  const normalized = walkPath.replace(/\\/g, "/");
  const lastSlash = normalized.lastIndexOf("/");
  const fileName = lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
  const walksDir = lastSlash === -1 ? "." : normalized.substring(0, lastSlash);
  const secondLastSlash = walksDir.lastIndexOf("/");
  const sourceRoot = secondLastSlash === -1 ? "." : walksDir.substring(0, secondLastSlash);
  const walkName = fileName.endsWith(".ts") ? fileName.slice(0, -3) : fileName;
  return { sourceRoot, walkName };
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const { sourceWalkPath, targetDir } = state;

    if (!sourceWalkPath) {
      return [edges.onError, { ...state, error: "No source walk path provided." }];
    }

    if (!targetDir) {
      return [edges.onError, {
        ...state,
        error: "No target directory provided.",
      }];
    }

    if (!(await utils.exists(sourceWalkPath))) {
      return [
        edges.onError,
        {
          ...state,
          error: `Source walk not found at "${sourceWalkPath}".`,
        },
      ];
    }

    const { sourceRoot, walkName } = parseWalkPath(sourceWalkPath);

    // Check if target directory is an Ambler project
    const isAmblerProject = await utils.exists(`${targetDir}/ambler.ts`);
    const isDenoProject = await utils.exists(`${targetDir}/deno.json`);

    const isNewProject = !(isAmblerProject && isDenoProject);

    return [isNewProject ? edges.onNewProject : edges.onExisting, {
      ...state,
      sourceRoot,
      walkName,
      isNewProject,
    }];
  };
};
