import { NodeFactory } from "../ambler.ts";

export interface State {
  sourceRoot: string;
  walkName: string;
  artifactType?: "walk" | "node" | "util";
  filesToCopy?: string[];
  externalDeps?: Record<string, string>;
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
    const { sourceRoot, walkName, artifactType = "walk" } = state;
    const filesToCopy: string[] = [];

    let sourceImports: Record<string, string> = {};
    try {
      const denoJsonContent = await utils.readFile(`${sourceRoot}/deno.json`);
      sourceImports =
        (JSON.parse(denoJsonContent).imports as Record<string, string>) ?? {};
    } catch {
      // Missing or unparseable — treat as empty
    }

    try {
      if (artifactType === "util") {
        const relUtilPath = `utils/${walkName}.ts`;
        if (await utils.exists(`${sourceRoot}/${relUtilPath}`)) {
          filesToCopy.push(relUtilPath);
        }
      } else if (artifactType === "node") {
        const relNodePath = `nodes/${walkName}.ts`;
        if (await utils.exists(`${sourceRoot}/${relNodePath}`)) {
          filesToCopy.push(relNodePath);
          const nodeContent = await utils.readFile(
            `${sourceRoot}/${relNodePath}`,
          );
          const utilRegex =
            /^\s*(?:import|export)\s+[\s\S]*?from\s+["']\.\.\/utils\/([^"']+\.ts)["']/gm;
          let match;
          while ((match = utilRegex.exec(nodeContent)) !== null) {
            const relPath = `utils/${match[1]}`;
            if (
              !filesToCopy.includes(relPath) &&
              await utils.exists(`${sourceRoot}/${relPath}`)
            ) {
              filesToCopy.push(relPath);
            }
          }
        }
      } else {
        const relWalkPath = `walks/${walkName}.ts`;
        const relSpecPath = `specs/${walkName}.md`;

        filesToCopy.push(relWalkPath);
        if (await utils.exists(`${sourceRoot}/${relSpecPath}`)) {
          filesToCopy.push(relSpecPath);
        }

        const content = await utils.readFile(`${sourceRoot}/${relWalkPath}`);

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

        for (const relNodePath of nodes) {
          const nodeContent = await utils.readFile(
            `${sourceRoot}/${relNodePath}`,
          );
          let utilMatch;
          while ((utilMatch = utilRegex.exec(nodeContent)) !== null) {
            const relPath = `utils/${utilMatch[1]}`;
            if (
              !filesToCopy.includes(relPath) &&
              await utils.exists(`${sourceRoot}/${relPath}`)
            ) {
              filesToCopy.push(relPath);
            }
          }
        }
      }

      const uniqueFiles = Array.from(new Set(filesToCopy));

      // Scan utils for bare-specifier external deps present in source deno.json imports
      const externalDeps: Record<string, string> = {};
      const bareImportRegex = /from\s+["']([^"'./][^"']*?)["']/gm;
      for (const file of uniqueFiles) {
        if (!file.startsWith("utils/")) continue;
        const content = await utils.readFile(`${sourceRoot}/${file}`);
        let match;
        while ((match = bareImportRegex.exec(content)) !== null) {
          const specifier = match[1];
          if (sourceImports[specifier]) {
            externalDeps[specifier] = sourceImports[specifier];
          }
        }
      }

      return [edges.onSuccess, {
        ...state,
        filesToCopy: uniqueFiles,
        externalDeps,
      }];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [edges.onError, {
        ...state,
        error: `Failed to analyze walk: ${message}`,
      }];
    }
  };
};
