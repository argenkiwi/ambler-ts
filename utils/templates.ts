/** Pure source-code templates for the scaffolding nodes. */

import { toCamel, toPascal, toShout } from "./naming.ts";

export interface StateField {
  name: string;
  type: string;
}

export interface EdgeMapping {
  fromNode: string;
  edge: string;
  /** Already rendered: `null` or a quoted node id. */
  toTarget: string;
}

export function renderNode(edges: string[], stateFields: StateField[]): string {
  const stateInterface =
    stateFields.length > 0
      ? stateFields.map((f) => `  ${f.name}: ${f.type};`).join("\n")
      : "  // Add state fields as needed\n";

  const edgeUnion = edges.map((e) => `"${e}"`).join(" | ");

  return `import type { NodeFactory } from "../ambler.ts";

export interface State {
${stateInterface}
}

export type Edge = ${edgeUnion};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  async (state) => {
    throw new Error("not yet implemented");
  };
`;
}

export function renderNodeTest(
  name: string,
  edges: string[],
  stateFields: StateField[],
): string {
  const defaultMockState =
    stateFields.length > 0
      ? stateFields
          .map((f) => {
            const val =
              f.type === "number" ? "0" : f.type === "boolean" ? "false" : '""';
            return `    ${f.name}: ${val},`;
          })
          .join("\n")
      : "";

  const testCases = edges
    .map(
      (
        edge,
      ) => `test("${toCamel(name)}Node should transition to ${edge}", async () => {
  const initialState: State = {
${defaultMockState}
  };

  const utils: Utils = {
    print: (_msg: string) => {},
  };

  // Replace with expected assertion once implemented
  expect(async () => {
    await factory({ ${edges.map((e) => `${e}: "${e}"`).join(", ")} }, utils)(initialState);
  }).toThrow("not yet implemented");
});`,
    )
    .join("\n\n");

  return `import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../${name}.ts";

${testCases}
`;
}

export function renderWalk(
  nodeNames: string[],
  edgeMappings: EdgeMapping[],
): string {
  const startNode = nodeNames[0];

  const imports = nodeNames
    .map(
      (n) =>
        `import type { Utils as ${toPascal(n)}Utils } from "../nodes/${n}.ts";\nimport defer * as ${toCamel(n)}Node from "../nodes/${n}.ts";`,
    )
    .join("\n");

  const nodeIds = nodeNames.map((n) => `"${toShout(n)}"`).join(" | ");

  const walkWiring = nodeNames
    .map((n) => {
      const matched = edgeMappings.filter((m) => m.fromNode === n);
      const edgeObj =
        matched.length > 0
          ? matched.map((m) => `${m.edge}: ${m.toTarget}`).join(", ")
          : `onDone: null`;
      return `    ${toShout(n)}: () => ${toCamel(n)}Node.factory({ ${edgeObj} }, utils.${toCamel(n)}),`;
    })
    .join("\n");

  return `import { ambler, walk } from "../ambler.ts";
${imports}

export interface State {
  // Shared state
}

export type NodeId = ${nodeIds};

export type WalkUtils = {
${nodeNames.map((n) => `  ${toCamel(n)}?: ${toPascal(n)}Utils;`).join("\n")}
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
${walkWiring}
  });
}

if (import.meta.main) {
  await walk(createWalk(), "${toShout(startNode)}", {});
}
`;
}

export function renderWalkTest(name: string): string {
  return `import { expect, test } from "bun:test";
import { createWalk } from "../${name}.ts";

test("${toCamel(name)} walk should instantiate cleanly", () => {
  const machine = createWalk();
  expect(machine).toBeDefined();
});
`;
}

export function renderWalkSpec(name: string, nodeNames: string[]): string {
  return `# ${toPascal(name)} Walk Specification

Initial node: \`${nodeNames[0]}\`.

## Nodes
${nodeNames.map((n) => `- \`${n}\``).join("\n")}
`;
}

export function renderUtil(name: string): string {
  return `/**
 * Shared utility ${name}.
 */

export interface ${toPascal(name)}Utils {
  // Utility signatures
}

export const default${toPascal(name)}Utils: ${toPascal(name)}Utils = {
  // Production implementation
};
`;
}
