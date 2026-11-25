import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { defaultScaffoldUtils, type ScaffoldUtils } from "../utils/fs.ts";
import { toCamel, toEdge, toKebab } from "../utils/naming.ts";
import { readSources, typeNames } from "../utils/node-source.ts";
import {
  renderNode,
  renderNodeTest,
  type StateField,
  type TypeImport,
} from "../utils/templates.ts";

export interface State {
  argv: string[];
  exitCode: number;
}

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

    // `--state count:number` gives a type; `--state count` reuses the type
    // another node already gives the field.
    const nodes = readSources(utils, "nodes");
    const stateFields: StateField[] = [];
    for (const item of values.state ?? []) {
      const colon = item.indexOf(":");
      const fieldName = toCamel(
        (colon < 0 ? item : item.slice(0, colon)).trim(),
      );
      if (colon >= 0) {
        stateFields.push({
          name: fieldName,
          type: item.slice(colon + 1).trim(),
        });
        continue;
      }
      const found = nodes.flatMap(({ file, source }) =>
        source.state
          .filter((f) => f.name === fieldName)
          .map((f) => ({ file, field: f })),
      );
      const types = [...new Set(found.map((f) => f.field.type))];
      if (types.length === 0) {
        return [
          edges.onError,
          failed(
            2,
            `Error: no node in nodes/ has a State field "${fieldName}"; give its type: --state ${fieldName}:<Type>`,
          ),
        ];
      }
      if (types.length > 1) {
        const given = found.map((f) => `${f.file}: ${f.field.type}`).join(", ");
        return [
          edges.onError,
          failed(
            2,
            `Error: nodes give "${fieldName}" different types (${given}); choose one: --state ${fieldName}:<Type>`,
          ),
        ];
      }
      stateFields.push({ ...found[0].field });
    }

    // Types the fields name, imported from the node or utility exporting them.
    const exporters = [...readSources(utils, "utils"), ...nodes];
    const typeImports: TypeImport[] = [];
    for (const typeName of new Set(
      stateFields.flatMap((f) => typeNames(f.type)),
    )) {
      const from = exporters.find(({ source }) =>
        source.exports.includes(typeName),
      );
      if (from) {
        typeImports.push({ name: typeName, file: from.file });
      } else {
        utils.printError(
          `Warning: no file in nodes/ or utils/ exports the type ${typeName}; declare or import it in ${nodeFile}`,
        );
      }
    }

    utils.mkdir(join("nodes", "tests"));
    utils.writeFile(nodeFile, renderNode(edgeNames, stateFields, typeImports));
    utils.writeFile(
      testFile,
      renderNodeTest(name, edgeNames, stateFields, typeImports),
    );
    utils.format([nodeFile, testFile]);

    utils.print(`Created ${nodeFile}`);
    utils.print(`Created ${testFile}`);
    return [edges.onDone, state];
  };
