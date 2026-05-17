import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceRoot: string;
  walkName: string;
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
    const { sourceRoot, walkName } = state;
    const filesToCopy: string[] = [];

    const relWalkPath = `walks/${walkName}.ts`;
    const relSpecPath = `specs/${walkName}.md`;

    filesToCopy.push(relWalkPath);
    if (await utils.exists(`${sourceRoot}/${relSpecPath}`)) {
      filesToCopy.push(relSpecPath);
    }

    try {
      const content = await utils.readFile(`${sourceRoot}/${relWalkPath}`);

      // Find nodes: import ... from "../nodes/name.ts"
      // Improved regex to handle leading whitespace, multi-line imports, and avoid comments
      const nodeRegex =
        /^\s*(?:import|export)\s+[\s\S]*?from\s+["']\.\.\/nodes\/([^"']+\.ts)["']/gm;
      let match;
      const nodes: string[] = [];
      while ((match = nodeRegex.exec(content)) !== null) {
        const relPath = `nodes/${match[1]}`;
        if (await utils.exists(`${sourceRoot}/${relPath}`)) {
          nodes.push(relPath);
        }
      }

      // Find utils: import ... from "../utils/name.ts"
      const utilRegex =
        /^\s*(?:import|export)\s+[\s\S]*?from\s+["']\.\.\/utils\/([^"']+\.ts)["']/gm;
      const utilsList: string[] = [];
      while ((match = utilRegex.exec(content)) !== null) {
        const relPath = `utils/${match[1]}`;
        if (await utils.exists(`${sourceRoot}/${relPath}`)) {
          utilsList.push(relPath);
        }
      }

      filesToCopy.push(...nodes);
      filesToCopy.push(...utilsList);

      // Recursive analysis for nodes to find their utils
      for (const relNodePath of nodes) {
        const nodeContent = await utils.readFile(`${sourceRoot}/${relNodePath}`);
        let utilMatch;
        while ((utilMatch = utilRegex.exec(nodeContent)) !== null) {
          const relPath = `utils/${utilMatch[1]}`;
          if (!filesToCopy.includes(relPath) && await utils.exists(`${sourceRoot}/${relPath}`)) {
            filesToCopy.push(relPath);
          }
        }
      }

      // Deduplicate
      const uniqueFiles = Array.from(new Set(filesToCopy));

      return [edges.onSuccess, { ...state, filesToCopy: uniqueFiles }];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, {
        ...state,
        error: `Failed to analyze walk: ${message}`,
      }];
    }
  };
};
