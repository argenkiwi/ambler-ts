import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { defaultScaffoldUtils, type ScaffoldUtils } from "../utils/fs.ts";
import { toEdge, toKebab, toShout } from "../utils/naming.ts";
import {
  type Contract,
  type Field,
  findTypeImports,
  type NodeSource,
  parseNode,
  parseRegistry,
  REGISTRY,
  readSources,
} from "../utils/node-source.ts";
import { addWalkScript } from "../utils/package-json.ts";
import {
  renderWalk,
  renderWalkSpec,
  renderWalkTest,
  type WalkNode,
} from "../utils/templates.ts";
import type { HasArgv, HasExitCode } from "./state.ts";

export interface State extends HasArgv, HasExitCode {}

export type Edge = "onDone" | "onError";

export type Utils = ScaffoldUtils;

interface EdgeFlag {
  node: string;
  edge: string;
  /** Kebab-case node name, or `null` to end the walk. */
  target: string | null;
}

/**
 * Parses `node.edge=target` flags, each of which may hold several edges
 * separated by commas. `halt` (or `null`) ends the walk. Returns the flag
 * that is not of that form as an error.
 */
function parseEdgeFlags(flags: string[]): EdgeFlag[] | { bad: string } {
  const parsed: EdgeFlag[] = [];
  for (const item of flags.flatMap((f) => f.split(","))) {
    const flag = item.trim();
    if (!flag) continue;
    const m = /^([^.=\s]+)\.([^.=\s]+)=([^.=\s]+)$/.exec(flag);
    if (!m) return { bad: flag };
    const ends = ["null", "halt"].includes(m[3].toLowerCase());
    parsed.push({
      node: toKebab(m[1]),
      edge: toEdge(m[2]),
      target: ends ? null : toKebab(m[3]),
    });
  }
  return parsed;
}

/** `ambler node` command that would create `name` with the edges given. */
function nodeCommand(name: string, flags: EdgeFlag[]): string {
  const outcomes = flags
    .filter((f) => f.node === name)
    .map((f) => toShout(f.edge.slice(2)).toLowerCase());
  const shape =
    outcomes.length > 0
      ? `--outcomes ${[...new Set(outcomes)].join(",")}`
      : "(--outcomes <a,b> | --terminal)";
  return `  ambler node ${name} ${shape}`;
}

/**
 * One `State` with the field of every contract the nodes compose, resolved
 * through the registry, in the order the nodes name them. The field keeps
 * the registry's optionality. Returns a contract the registry lacks, or a
 * node that declares fields of its own, as an error.
 */
function mergeState(
  nodes: { file: string; source: NodeSource }[],
  registry: Contract[],
): Field[] | { error: string } {
  const merged = new Map<string, Field>();
  for (const { file, source } of nodes) {
    if (source.state.length > 0) {
      const own = source.state.map((f) => f.name).join(", ");
      return {
        error: `${file} declares State fields of its own (${own}); move each to a Has* contract in ${REGISTRY} and extend it`,
      };
    }
    for (const name of source.contracts) {
      const contract = registry.find((c) => c.name === name);
      if (!contract) {
        return {
          error: `${file} extends ${name}, which ${REGISTRY} does not declare`,
        };
      }
      if (!merged.has(contract.field.name)) {
        merged.set(contract.field.name, { ...contract.field });
      }
    }
  }
  return [...merged.values()];
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

    const nodeNames = [
      ...new Set(
        values.nodes
          .split(",")
          .map((n) => toKebab(n.trim()))
          .filter(Boolean),
      ),
    ];

    const flags = parseEdgeFlags(values.edge ?? []);
    if ("bad" in flags) {
      return [
        edges.onError,
        failed(
          2,
          `Error: --edge ${flags.bad} is not <node>.<outcome>=<node|halt>`,
        ),
      ];
    }

    const missing = nodeNames.filter(
      (n) => !utils.exists(join("nodes", `${n}.ts`)),
    );
    if (missing.length > 0) {
      return [
        edges.onError,
        failed(
          2,
          [
            `Error: no node at ${missing.map((n) => join("nodes", `${n}.ts`)).join(", ")}. Create ${missing.length > 1 ? "them" : "it"} first:`,
            ...missing.map((n) => nodeCommand(n, flags)),
          ].join("\n"),
        ),
      ];
    }

    const nodes = nodeNames.map((n) => {
      const file = join("nodes", `${n}.ts`);
      return { name: n, file, source: parseNode(utils.readFile(file)) };
    });

    for (const flag of flags) {
      const from = nodes.find((n) => n.name === flag.node);
      if (!from) {
        return [
          edges.onError,
          failed(
            2,
            `Error: --edge names ${flag.node}, which is not in --nodes`,
          ),
        ];
      }
      if (!from.source.edges.includes(flag.edge)) {
        return [
          edges.onError,
          failed(
            2,
            `Error: ${flag.node} has no edge ${flag.edge}; its edges are ${from.source.edges.join(", ")}`,
          ),
        ];
      }
      if (flag.target !== null && !nodeNames.includes(flag.target)) {
        return [
          edges.onError,
          failed(
            2,
            `Error: ${flag.node}.${flag.edge} leads to ${flag.target}, which is not in --nodes`,
          ),
        ];
      }
    }

    // Every edge of every node is wired: to the --edge target, to null for a
    // node whose only edge is onDone, or else to an `unwired(…)` placeholder.
    const walkNodes: WalkNode[] = nodes.map((n) => ({
      name: n.name,
      edges: n.source.edges.map((edge) => {
        const flag = flags.findLast(
          (f) => f.node === n.name && f.edge === edge,
        );
        const id = `${toShout(n.name)}.${edge}`;
        const target = flag
          ? flag.target === null
            ? "null"
            : `"${toShout(flag.target)}"`
          : n.source.edges.length === 1 && edge === "onDone"
            ? "null"
            : `unwired("${id}")`;
        return { edge, target };
      }),
    }));

    const registry = utils.exists(REGISTRY)
      ? parseRegistry(utils.readFile(REGISTRY))
      : [];
    const stateFields = mergeState(nodes, registry);
    if ("error" in stateFields) {
      return [edges.onError, failed(2, `Error: ${stateFields.error}`)];
    }

    const { imports: typeImports, missing: missingTypes } = findTypeImports(
      stateFields.map((f) => f.type),
      [...readSources(utils, "utils"), ...readSources(utils, "nodes")],
    );
    for (const typeName of missingTypes) {
      utils.printError(
        `Warning: no file in nodes/ or utils/ exports the type ${typeName}; declare or import it in ${walkFile}`,
      );
    }

    utils.mkdir(join("walks", "tests"));
    utils.mkdir("specs");

    utils.writeFile(walkFile, renderWalk(walkNodes, stateFields, typeImports));
    utils.writeFile(testFile, renderWalkTest(name));
    utils.format([walkFile, testFile]);
    utils.print(`Created ${walkFile}`);
    utils.print(`Created ${testFile}`);

    if (utils.exists(specFile)) {
      utils.print(`Kept ${specFile}`);
    } else {
      utils.writeFile(specFile, renderWalkSpec(name, nodeNames));
      utils.print(`Created ${specFile}`);
    }

    if (!values["no-runner"]) {
      if (!utils.exists("package.json")) {
        utils.printError(
          `Warning: no package.json; add a script that runs bun ${walkFile}`,
        );
      } else {
        const updated = addWalkScript(utils.readFile("package.json"), name);
        if (updated === null) {
          utils.print(`Kept the ${name} script in package.json`);
        } else {
          utils.writeFile("package.json", updated);
          utils.print(`Added the ${name} script to package.json`);
        }
      }
    }

    return [edges.onDone, state];
  };
