import { readFile, writeFile } from "node:fs/promises";
import type { NodeFactory } from "../ambler.ts";

export interface State {
  targetDir: string;
  sourceRoot: string;
  walkName: string;
  artifactType?: "walk" | "node" | "util";
  externalDeps?: Record<string, string>;
  error?: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  readTextFile: (path: string) => Promise<string>;
  writeTextFile: (path: string, data: string) => Promise<void>;
};

const defaultUtils: Utils = {
  readTextFile: (path) => readFile(path, "utf8"),
  writeTextFile: (path, data) => writeFile(path, data),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const {
      targetDir,
      sourceRoot,
      walkName,
      artifactType = "walk",
      externalDeps = {},
    } = state;

    let packageJson: Record<string, unknown> = {};
    try {
      packageJson = JSON.parse(
        await utils.readTextFile(`${targetDir}/package.json`),
      );
    } catch {
      // Missing or unparseable — start fresh
    }

    let changed = false;

    if (artifactType === "walk") {
      let scriptCommand = `bun walks/${walkName}.ts`;
      try {
        const sourcePackageJson = JSON.parse(
          await utils.readTextFile(`${sourceRoot}/package.json`),
        );
        const sourceScript = (
          sourcePackageJson.scripts as Record<string, string>
        )?.[walkName];
        if (sourceScript) scriptCommand = sourceScript;
      } catch {
        // Use default command
      }
      if (!packageJson.scripts) packageJson.scripts = {};
      (packageJson.scripts as Record<string, string>)[walkName] = scriptCommand;
      changed = true;
    }

    if (Object.keys(externalDeps).length > 0) {
      if (!packageJson.dependencies) packageJson.dependencies = {};
      for (const [key, value] of Object.entries(externalDeps)) {
        (packageJson.dependencies as Record<string, string>)[key] = value;
      }
      changed = true;
    }

    if (changed) {
      try {
        await utils.writeTextFile(
          `${targetDir}/package.json`,
          `${JSON.stringify(packageJson, null, 2)}\n`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return [
          edges.onError,
          {
            ...state,
            error: `Failed to update package.json: ${message}`,
          },
        ];
      }
    }

    return [edges.onSuccess, state];
  };
};
