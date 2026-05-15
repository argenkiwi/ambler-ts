import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceWalk: string;
  filesToCopy?: string[];
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  readFile: (path: string) => Promise<string>;
  exists: (path: string) => Promise<boolean>;
};

const defaultUtils: Utils = {
  readFile: (path) => Deno.readTextFile(path),
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
    const { sourceWalk } = state;
    const filesToCopy: string[] = [];

    const walkPath = `walks/${sourceWalk}.ts`;
    const specPath = `specs/${sourceWalk}.md`;

    filesToCopy.push(walkPath);
    if (await utils.exists(specPath)) {
      filesToCopy.push(specPath);
    }

    try {
      const content = await utils.readFile(walkPath);
      
      // Find nodes: import ... from "../nodes/name.ts"
      const nodeRegex = /from\s+["']\.\.\/nodes\/([^"']+\.ts)["']/g;
      let match;
      const nodes: string[] = [];
      while ((match = nodeRegex.exec(content)) !== null) {
        nodes.push(`nodes/${match[1]}`);
      }

      // Find utils: import ... from "../utils/name.ts"
      // Nodes also import utils, so we should check nodes too?
      // The requirement says "referenced by the walk", but also "only the nodes and utils referenced by the walk are copied".
      // Usually nodes import utils.
      const utilRegex = /from\s+["']\.\.\/utils\/([^"']+\.ts)["']/g;
      const utilsList: string[] = [];
      while ((match = utilRegex.exec(content)) !== null) {
        utilsList.push(`utils/${match[1]}`);
      }

      filesToCopy.push(...nodes);
      filesToCopy.push(...utilsList);

      // Recursive analysis for nodes to find their utils
      for (const nodePath of nodes) {
        if (await utils.exists(nodePath)) {
          const nodeContent = await utils.readFile(nodePath);
          let utilMatch;
          while ((utilMatch = utilRegex.exec(nodeContent)) !== null) {
            const upath = `utils/${utilMatch[1]}`;
            if (!filesToCopy.includes(upath)) {
              filesToCopy.push(upath);
            }
          }
        }
      }

      // Deduplicate
      const uniqueFiles = Array.from(new Set(filesToCopy));

      return [edges.onSuccess, { ...state, filesToCopy: uniqueFiles }];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, { ...state, error: `Failed to analyze walk: ${message}` }];
    }
  };
};
