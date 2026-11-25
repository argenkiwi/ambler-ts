import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { defaultScaffoldUtils, type ScaffoldUtils } from "../utils/fs.ts";
import { toEdge, toKebab, toShout } from "../utils/naming.ts";
import {
  type EdgeMapping,
  renderWalk,
  renderWalkSpec,
  renderWalkTest,
} from "../utils/templates.ts";

export interface State {
  argv: string[];
  exitCode: number;
}

export type Edge = "onDone" | "onError";

export type Utils = ScaffoldUtils;

/** Parses `from.edge=target` flags; `null`/`halt` targets end the walk. */
function parseEdgeMappings(flags: string[]): EdgeMapping[] {
  const mappings: EdgeMapping[] = [];
  for (const e of flags) {
    if (!e.includes("=") || !e.includes(".")) continue;
    const [from, to] = e.split("=");
    const [node, edge] = from.split(".");
    const target = to.trim();
    const ends = ["null", "halt"].includes(target.toLowerCase());
    mappings.push({
      fromNode: toKebab(node.trim()),
      edge: toEdge(edge.trim()),
      toTarget: ends ? "null" : `"${toShout(target)}"`,
    });
  }
  return mappings;
}

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultScaffoldUtils) =>
  (state) => {
    const failed = (code: number, msg: string) => {
      utils.printError(msg);
      return { ...state, exitCode: code };
    };

    const { values, positionals } = parseArgs({
      args: state.argv,
      options: {
        nodes: { type: "string" },
        edge: { type: "string", multiple: true },
        // Accepted for compatibility; currently has no effect.
        "no-runner": { type: "boolean" },
      },
      allowPositionals: true,
    });

    const rawName = positionals[0];
    if (!rawName) {
      return [edges.onError, failed(2, "Error: walk name is required")];
    }

    const name = toKebab(rawName);
    const walkFile = join("walks", `${name}.ts`);
    const testFile = join("walks", "tests", `${name}.test.ts`);
    const specFile = join("specs", `${name}.md`);

    if (utils.exists(walkFile)) {
      return [
        edges.onError,
        failed(1, `Error: Walk already exists at ${walkFile}`),
      ];
    }

    if (!values.nodes) {
      return [edges.onError, failed(2, "Error: --nodes must be provided")];
    }

    const nodeNames = values.nodes
      .split(",")
      .map((n) => toKebab(n.trim()))
      .filter(Boolean);

    utils.mkdir(join("walks", "tests"));
    utils.mkdir("specs");

    utils.writeFile(
      walkFile,
      renderWalk(nodeNames, parseEdgeMappings(values.edge ?? [])),
    );
    if (!utils.exists(specFile)) {
      utils.writeFile(specFile, renderWalkSpec(name, nodeNames));
    }
    utils.writeFile(testFile, renderWalkTest(name));
    utils.format([walkFile, testFile]);

    utils.print(`Created ${walkFile}`);
    utils.print(`Created ${testFile}`);
    utils.print(`Created ${specFile}`);
    return [edges.onDone, state];
  };
