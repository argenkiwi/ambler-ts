import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { defaultScaffoldUtils, type ScaffoldUtils } from "../utils/fs.ts";
import { toKebab } from "../utils/naming.ts";
import { renderUtil } from "../utils/templates.ts";

export interface State {
  argv: string[];
  exitCode: number;
}

export type Edge = "onDone" | "onError";

export type Utils = ScaffoldUtils;

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultScaffoldUtils) =>
  (state) => {
    const { positionals } = parseArgs({
      args: state.argv,
      allowPositionals: true,
    });

    const rawName = positionals[0];
    if (!rawName) {
      utils.printError("Error: util name is required");
      return [edges.onError, { ...state, exitCode: 2 }];
    }

    const name = toKebab(rawName);
    const utilFile = join("utils", `${name}.ts`);

    if (utils.exists(utilFile)) {
      utils.printError(`Error: Util already exists at ${utilFile}`);
      return [edges.onError, { ...state, exitCode: 1 }];
    }

    utils.mkdir("utils");
    utils.writeFile(utilFile, renderUtil(name));
    utils.print(`Created ${utilFile}`);
    return [edges.onDone, state];
  };
