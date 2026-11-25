/** Pure source-code templates for the scaffolding nodes. */

import { dirname, relative } from "node:path";
import { toCamel, toPascal, toShout } from "./naming.ts";

export interface StateField {
  name: string;
  type: string;
  optional?: boolean;
}

/** A type a generated file imports: its name and the project file exporting it. */
export interface TypeImport {
  name: string;
  /** Project-relative, e.g. `utils/game.ts`. */
  file: string;
}

export interface EdgeMapping {
  fromNode: string;
  edge: string;
  /** Already rendered: `null` or a quoted node id. */
  toTarget: string;
}

/**
 * An interface with `fields`, or an empty one with the Biome suppression that
 * keeps `noEmptyInterface` quiet until the first field is added.
 */
function renderInterface(
  name: string,
  fields: StateField[],
  why: string,
): string {
  if (fields.length === 0) {
    return `// biome-ignore lint/suspicious/noEmptyInterface: ${why}
export interface ${name} {}`;
  }
  const body = fields
    .map((f) => `  ${f.name}${f.optional ? "?" : ""}: ${f.type};`)
    .join("\n");
  return `export interface ${name} {
${body}
}`;
}

/** `import type` lines for `types`, as seen from the project file `from`. */
function renderTypeImports(from: string, types: TypeImport[]): string {
  const byFile = new Map<string, string[]>();
  for (const t of types) {
    byFile.set(t.file, [...(byFile.get(t.file) ?? []), t.name]);
  }
  return [...byFile]
    .map(([file, names]) => {
      let spec = relative(dirname(from), file);
      if (!spec.startsWith(".")) spec = `./${spec}`;
      return `import type { ${names.join(", ")} } from "${spec}";\n`;
    })
    .join("");
}

/** A placeholder of `type` for a test's initial state; it type-checks. */
export function mockValue(type: string): string {
  if (type === "number") return "0";
  if (type === "boolean") return "false";
  if (type === "string") return '""';
  if (/\[\]$/.test(type) || /^(Readonly)?Array</.test(type)) return "[]";
  const members = type.split("|").map((m) => m.trim());
  if (members.includes("null")) return "null";
  if (members.includes("undefined")) return "undefined";
  const literal = /^(["'][^"']*["']|-?\d+(\.\d+)?|true|false)$/;
  if (members.every((m) => literal.test(m))) return members[0];
  return `{} as ${type}`;
}

export function renderNode(
  edges: string[],
  stateFields: StateField[],
  typeImports: TypeImport[] = [],
): string {
  const edgeUnion = edges.map((e) => `"${e}"`).join(" | ");

  return `import type { NodeFactory } from "../ambler.ts";
${renderTypeImports("nodes/node.ts", typeImports)}
${renderInterface("State", stateFields, "add the fields this node reads and writes")}

export type Edge = ${edgeUnion};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (_edges, _utils = defaultUtils) =>
  async (_state) => {
    throw new Error("not yet implemented");
  };
`;
}

export function renderNodeTest(
  name: string,
  edges: string[],
  stateFields: StateField[],
  typeImports: TypeImport[] = [],
): string {
  const mockFields = stateFields
    .filter((f) => !f.optional)
    .map((f) => `    ${f.name}: ${mockValue(f.type)},`)
    .join("\n");
  const defaultMockState = mockFields ? `{\n${mockFields}\n  }` : "{}";

  const testCases = edges
    .map(
      (
        edge,
      ) => `test("${toCamel(name)}Node should transition to ${edge}", async () => {
  const initialState: State = ${defaultMockState};

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
${renderTypeImports("nodes/tests/test.ts", typeImports)}
${testCases}
`;
}

export function renderWalk(
  nodeNames: string[],
  edgeMappings: EdgeMapping[],
): string {
  const startNode = nodeNames[0];

  // Sorted by path, as Biome's organizeImports wants them.
  const imports = [...nodeNames]
    .sort()
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

${renderInterface("State", [], "add the fields the nodes share")}

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

${renderInterface(`${toPascal(name)}Utils`, [], "add one function per side effect")}

export const default${toPascal(name)}Utils: ${toPascal(name)}Utils = {
  // Production implementation
};
`;
}
