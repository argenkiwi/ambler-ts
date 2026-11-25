import { join } from "node:path";
import { parseArgs } from "node:util";
import type { NodeFactory } from "../ambler.ts";
import { defaultScaffoldUtils, type ScaffoldUtils } from "../utils/fs.ts";
import { toCamel, toEdge, toKebab } from "../utils/naming.ts";
import {
  renderNode,
  renderNodeTest,
  type StateField,
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

    // State fields look like "count:number"; the type defaults to string.
    const stateFields: StateField[] = (values.state ?? []).map((item) => {
      if (!item.includes(":")) {
        return { name: toCamel(item.trim()), type: "string" };
      }
      const [fn, ft] = item.split(":");
      return { name: toCamel(fn.trim()), type: ft.trim() };
    });

    utils.mkdir(join("nodes", "tests"));
    utils.writeFile(nodeFile, renderNode(edgeNames, stateFields));
    utils.writeFile(testFile, renderNodeTest(name, edgeNames, stateFields));
    utils.format([nodeFile, testFile]);

    utils.print(`Created ${nodeFile}`);
    utils.print(`Created ${testFile}`);
    return [edges.onDone, state];
  };
