import { writeFile } from "node:fs/promises";
import type { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  writeTextFile: (path: string, data: string) => Promise<void>;
};

const defaultUtils: Utils = {
  writeTextFile: (path, data) => writeFile(path, data),
};

/** Project files written into a new Ambler project, keyed by file name. */
export const PROJECT_FILES: Record<string, string> = {
  "package.json": `{
  "private": true,
  "type": "module",
  "scripts": {
    "test": "bun test",
    "check": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bun": "^1.4.5",
    "typescript": "^7.0.2"
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "preserve",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["bun"]
  }
}
`,
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    for (const [name, content] of Object.entries(PROJECT_FILES)) {
      try {
        await utils.writeTextFile(`${state.targetDir}/${name}`, content);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return [
          edges.onError,
          {
            ...state,
            error: `Failed to write ${name}: ${message}`,
          },
        ];
      }
    }

    return [edges.onSuccess, state];
  };
};
