import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceWalkPath: string;
  targetDir: string;
  sourceRoot?: string;
  walkName?: string;
  artifactType?: "walk" | "node" | "util";
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

function parseSourcePath(
  srcPath: string,
): {
  sourceRoot: string;
  walkName: string;
  artifactType: "walk" | "node" | "util";
} {
  const normalized = srcPath.replace(/\\/g, "/");
  const lastSlash = normalized.lastIndexOf("/");
  const fileName = lastSlash === -1
    ? normalized
    : normalized.substring(lastSlash + 1);
  const parentDir = lastSlash === -1 ? "." : normalized.substring(0, lastSlash);
  const lastParentSlash = parentDir.lastIndexOf("/");
  const dirName = lastParentSlash === -1
    ? parentDir
    : parentDir.substring(lastParentSlash + 1);
  const sourceRoot = lastParentSlash === -1
    ? "."
    : parentDir.substring(0, lastParentSlash);
  const walkName = fileName.endsWith(".ts") ? fileName.slice(0, -3) : fileName;
  const artifactType: "walk" | "node" | "util" = dirName === "nodes"
    ? "node"
    : dirName === "utils"
    ? "util"
    : "walk";
  return { sourceRoot, walkName, artifactType };
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const { sourceWalkPath, targetDir } = state;

    if (!sourceWalkPath) {
      return [edges.onError, {
        ...state,
        error: "No source walk path provided.",
      }];
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

    const { sourceRoot, walkName, artifactType } = parseSourcePath(
      sourceWalkPath,
    );

    // Check if target directory is an Ambler project
    const isAmblerProject = await utils.exists(`${targetDir}/ambler.ts`);
    const isDenoProject = await utils.exists(`${targetDir}/deno.json`);

    const isNewProject = !(isAmblerProject && isDenoProject);

    return [isNewProject ? edges.onNewProject : edges.onExisting, {
      ...state,
      sourceRoot,
      walkName,
      artifactType,
      isNewProject,
    }];
  };
};
