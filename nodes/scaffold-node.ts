import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { defaultScaffoldUtils, type ScaffoldUtils } from "../utils/fs.ts";
import { toCamel, toEdge, toKebab } from "../utils/naming.ts";
import {
  appendContracts,
  type Contract,
  contractName,
  findTypeImports,
  parseRegistry,
  REGISTRY,
  readSources,
} from "../utils/node-source.ts";
import {
  renderNode,
  renderNodeTest,
  type StateField,
} from "../utils/templates.ts";
import type { HasArgv, HasExitCode } from "./state.ts";

export interface State extends HasArgv, HasExitCode {}

export type Edge = "onDone" | "onError";

export type Utils = ScaffoldUtils;

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
        outcomes: { type: "string" },
        terminal: { type: "boolean" },
        fallible: { type: "boolean" },
        state: { type: "string", multiple: true },
      },
      allowPositionals: true,
    });

    const rawName = positionals[0];
    if (!rawName) {
      return [edges.onError, failed(2, "Error: node name is required")];
    }

    const name = toKebab(rawName);
    const nodeFile = join("nodes", `${name}.ts`);
    const testFile = join("nodes", "tests", `${name}.test.ts`);

    if (utils.exists(nodeFile)) {
      return [
        edges.onError,
        failed(1, `Error: Node already exists at ${nodeFile}`),
      ];
    }

    let edgeNames: string[];
    if (values.terminal) {
      edgeNames = ["onDone"];
    } else if (values.outcomes) {
      edgeNames = values.outcomes
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean)
        .map(toEdge);
    } else {
      return [
        edges.onError,
        failed(2, "Error: Specify either --outcomes <a,b> or --terminal"),
      ];
    }

    // Each field is a `Has*` contract in the registry, nodes/state.ts.
    // `--state count` reuses `HasCount`; `--state count:number` reuses it if
    // the types agree, or adds it.
    const registrySource = utils.exists(REGISTRY)
      ? utils.readFile(REGISTRY)
      : "";
    const registry = parseRegistry(registrySource);
    const contracts: Contract[] = [];
    const added: Contract[] = [];
    for (const item of values.state ?? []) {
      const colon = item.indexOf(":");
      const fieldName = toCamel(
        (colon < 0 ? item : item.slice(0, colon)).trim(),
      );
      const contract = contractName(fieldName);
      const known = [...registry, ...added].find((c) => c.name === contract);
      if (colon < 0) {
        if (!known) {
          return [
            edges.onError,
            failed(
              2,
              `Error: ${REGISTRY} has no ${contract}; give the field's type: --state ${fieldName}:<Type>`,
            ),
          ];
        }
      } else {
        const type = item.slice(colon + 1).trim();
        if (known && known.field.type !== type.replace(/\s+/g, " ")) {
          return [
            edges.onError,
            failed(
              2,
              `Error: ${REGISTRY} gives ${contract} the type ${known.field.type}, not ${type}; use --state ${fieldName}, or change ${contract} by hand`,
            ),
          ];
        }
        if (!known) {
          added.push({
            name: contract,
            field: { name: fieldName, type, optional: false },
          });
        }
      }
      const resolved = known ?? added[added.length - 1];
      if (!contracts.includes(resolved)) contracts.push(resolved);
    }
    const stateFields: StateField[] = contracts.map((c) => ({ ...c.field }));

    // Types the fields name, imported from the node or utility exporting them
    // (the registry itself among them).
    const exporters = [
      ...readSources(utils, "utils"),
      ...readSources(utils, "nodes"),
    ];
    const { imports: typeImports, missing } = findTypeImports(
      stateFields.map((f) => f.type),
      exporters,
    );
    for (const typeName of missing) {
      utils.printError(
        `Warning: no file in nodes/ or utils/ exports the type ${typeName}; declare or import it in ${REGISTRY}`,
      );
    }

    utils.mkdir(join("nodes", "tests"));
    const written = [nodeFile, testFile];
    if (added.length > 0) {
      const { imports: registryImports } = findTypeImports(
        added.map((c) => c.field.type),
        exporters,
      );
      utils.writeFile(
        REGISTRY,
        appendContracts(registrySource, added, registryImports),
      );
      written.unshift(REGISTRY);
    }
    utils.writeFile(
      nodeFile,
      renderNode(
        edgeNames,
        contracts.map((c) => c.name),
      ),
    );
    utils.writeFile(
      testFile,
      renderNodeTest(name, edgeNames, stateFields, typeImports),
    );
    utils.format(written);

    for (const c of added) utils.print(`Added ${c.name} to ${REGISTRY}`);
    utils.print(`Created ${nodeFile}`);
    utils.print(`Created ${testFile}`);
    return [edges.onDone, state];
  };
