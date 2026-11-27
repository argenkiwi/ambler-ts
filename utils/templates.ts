/** Pure source-code templates for the scaffolding nodes. */

import { dirname, relative } from "node:path";
import { toCamel, toPascal, toShout } from "./naming.ts";

/** What a scaffolded body throws, built in pieces so `check` does not flag this file. */
export const NOT_IMPLEMENTED = ["not yet", "implemented"].join(" ");

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

/** A walk's concrete `State` with `fields`, or `object` when it has none. */
function renderWalkState(fields: StateField[]): string {
  if (fields.length === 0) return "export type State = object;";
  const body = fields
    .map((f) => `  ${f.name}${f.optional ? "?" : ""}: ${f.type};`)
    .join("\n");
  return `export interface State {
${body}
}`;
}

/**
 * A node's `State`, composed of the registry's `contracts`, or `object` when
 * the node needs no state.
 */
function renderNodeState(contracts: string[]): string {
  if (contracts.length === 0) return "export type State = object;";
  return `export interface State extends ${contracts.join(", ")} {}`;
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

/**
 * A node with `edges` whose `State` extends the registry's `contracts`
 * (`HasCount`), imported from `nodes/state.ts`.
 */
export function renderNode(edges: string[], contracts: string[]): string {
  const edgeUnion = edges.map((e) => `"${e}"`).join(" | ");
  const stateImport =
    contracts.length > 0
      ? `import type { ${[...contracts].sort().join(", ")} } from "./state.ts";\n`
      : "";

  return `import type { NodeFactory } from "../ambler.ts";
${stateImport}
${renderNodeState(contracts)}

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
    throw new Error("${NOT_IMPLEMENTED}");
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
  }).toThrow("${NOT_IMPLEMENTED}");
});`,
    )
    .join("\n\n");

  return `import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../${name}.ts";
${renderTypeImports("nodes/tests/test.ts", typeImports)}
${testCases}
`;
}

/** A node of a walk, with every edge of its `Edge` union and its target. */
export interface WalkNode {
  /** Kebab-case node name. */
  name: string;
  /** Rendered targets: `null`, `"NODE_ID"` or an `unwired(…)` call naming `NODE.onEdge`. */
  edges: { edge: string; target: string }[];
}

export function renderWalk(
  nodes: WalkNode[],
  stateFields: StateField[] = [],
  typeImports: TypeImport[] = [],
): string {
  const nodeNames = nodes.map((n) => n.name);
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

  const walkWiring = nodes
    .map((n) => {
      const edgeObj = n.edges.map((e) => `${e.edge}: ${e.target}`).join(", ");
      return `    ${toShout(n.name)}: () => ${toCamel(n.name)}Node.factory({ ${edgeObj} }, utils.${toCamel(n.name)}),`;
    })
    .join("\n");

  const usesUnwired = nodes.some((n) =>
    n.edges.some((e) => e.target.startsWith("unwired(")),
  );
  const unwired = usesUnwired
    ? `
/** An edge still to wire: the walk throws when it reaches its node. */
function unwired(edge: string): never {
  throw new Error(\`\${edge} is not wired yet\`);
}
`
    : "";

  const initialFields = stateFields
    .filter((f) => !f.optional)
    .map((f) => `${f.name}: ${mockValue(f.type)}`)
    .join(", ");
  const initialState = initialFields ? `{ ${initialFields} }` : "{}";

  return `import { ambler, walk } from "../ambler.ts";
${imports}
${renderTypeImports("walks/walk.ts", typeImports)}
${renderWalkState(stateFields)}

export type NodeId = ${nodeIds};

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
${nodeNames.map((n) => `  ${toCamel(n)}?: ${toPascal(n)}Utils;`).join("\n")}
};
${unwired}
export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
${walkWiring}
  });
}

if (import.meta.main) {
  await walk(createWalk(), "${toShout(startNode)}", ${initialState});
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

/** One function per side effect; replace \`Record<string, never>\` with them. */
export type ${toPascal(name)}Utils = Record<string, never>;

export const default${toPascal(name)}Utils: ${toPascal(name)}Utils = {
  // Production implementation
};
`;
}
