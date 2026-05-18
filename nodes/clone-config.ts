import { NodeFactory } from "../ambler.ts";

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
  readTextFile: (path) => Deno.readTextFile(path),
  writeTextFile: (path, data) => Deno.writeTextFile(path, data),
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

    let denoJson: Record<string, unknown> = {};
    try {
      denoJson = JSON.parse(await utils.readTextFile(`${targetDir}/deno.json`));
    } catch {
      // Missing or unparseable — start fresh
    }

    let changed = false;

    if (artifactType === "walk") {
      let taskCommand =
        `deno run --allow-read --allow-write walks/${walkName}.ts`;
      try {
        const sourceDenoJson = JSON.parse(
          await utils.readTextFile(`${sourceRoot}/deno.json`),
        );
        const sourceTask = (sourceDenoJson.tasks as Record<string, string>)
          ?.[walkName];
        if (sourceTask) taskCommand = sourceTask;
      } catch {
        // Use default command
      }
      if (!denoJson.tasks) denoJson.tasks = {};
      (denoJson.tasks as Record<string, string>)[walkName] = taskCommand;
      changed = true;
    }

    if (Object.keys(externalDeps).length > 0) {
      if (!denoJson.imports) denoJson.imports = {};
      for (const [key, value] of Object.entries(externalDeps)) {
        (denoJson.imports as Record<string, string>)[key] = value;
      }
      changed = true;
    }

    if (changed) {
      try {
        await utils.writeTextFile(
          `${targetDir}/deno.json`,
          JSON.stringify(denoJson, null, 2) + "\n",
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return [edges.onError, {
          ...state,
          error: `Failed to update deno.json: ${message}`,
        }];
      }
    }

    return [edges.onSuccess, state];
  };
};
