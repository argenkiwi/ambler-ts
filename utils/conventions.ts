/**
 * The structural conventions `check` verifies before running the tools. Pure
 * functions over source text: each returns `<path>:<line>: <rule>: <what to do>`
 * lines, one per violation.
 */

import { toPascal } from "./naming.ts";
import { declarations } from "./node-source.ts";

// Built in pieces so that this module is not itself a placeholder the rule finds.
const NOT_YET = ["not yet", "implemented"].join(" ");
const QUOTED_NOT_YET = `(["'\`])${NOT_YET}\\1`;

/** The placeholders the scaffolders write, and what to do about each. */
const PLACEHOLDERS: {
  pattern: RegExp;
  what: (match: RegExpExecArray) => string;
}[] = [
  {
    pattern: new RegExp(
      `throw\\s+new\\s+Error\\(\\s*${QUOTED_NOT_YET}\\s*\\)`,
      "g",
    ),
    what: () => `implement this: it still throws \`${NOT_YET}\``,
  },
  {
    pattern: new RegExp(`\\.toThrow\\(\\s*${QUOTED_NOT_YET}\\s*\\)`, "g"),
    what: () =>
      `finish this test: assert the next node and the new state, not \`${NOT_YET}\``,
  },
  {
    // A call with a literal edge; the definition and `${…}` templates are not calls.
    pattern: /\bunwired\(\s*(["'`])([^"'`$\n]+)\1\s*\)/g,
    what: (match) =>
      `wire ${match[2]}: name the next node, or null to end the walk`,
  },
];

function lineOf(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (source[i] === "\n") line++;
  return line;
}

/**
 * The placeholders the scaffolders write that are still in `source`: a body that
 * throws `not yet implemented`, a test that only expects it, and an edge left
 * `unwired(…)`. Other mentions of the words are not placeholders.
 */
export function todo(path: string, source: string): string[] {
  const found: { index: number; what: string }[] = [];
  for (const { pattern, what } of PLACEHOLDERS) {
    for (const match of source.matchAll(pattern)) {
      found.push({ index: match.index, what: what(match) });
    }
  }
  return found
    .sort((a, b) => a.index - b.index)
    .map(
      ({ index, what }) => `${path}:${lineOf(source, index)}: todo: ${what}`,
    );
}

/** Where the `Has*` state contracts live, and the files that are nodes. */
const REGISTRY = "nodes/state.ts";
const NODE_FILE = /^nodes\/[^/]+\.ts$/;

/**
 * The state contracts: `Has*` interfaces are declared only in the registry,
 * `nodes/state.ts`, one field each, named `Has` and the field in PascalCase;
 * every node exports a `State` that only extends them
 * (`interface State extends HasA, HasB {}`), or `type State = object`.
 */
export function stateContracts(path: string, source: string): string[] {
  const found: { index: number; what: string }[] = [];
  const decls = declarations(source);
  for (const d of decls.filter((d) => /^Has[A-Z]/.test(d.name))) {
    if (path !== REGISTRY) {
      found.push({
        index: d.index,
        what: `move ${d.name} to ${REGISTRY}: only the registry declares Has* contracts`,
      });
    } else if (
      d.kind !== "interface" ||
      d.extends.length > 0 ||
      d.memberCount !== 1 ||
      d.fields.length !== 1
    ) {
      found.push({
        index: d.index,
        what: `give ${d.name} exactly one field and nothing else: interface ${d.name} { field: T }`,
      });
    } else if (d.name !== `Has${toPascal(d.fields[0].name)}`) {
      found.push({
        index: d.index,
        what: `rename ${d.name} to Has${toPascal(d.fields[0].name)}, after its field ${d.fields[0].name}`,
      });
    }
  }
  if (NODE_FILE.test(path) && path !== REGISTRY) {
    const state = decls.find((d) => d.exported && d.name === "State");
    if (!state) {
      found.push({
        index: 0,
        what: "export State: interface State extends HasA, HasB {}, or type State = object for none",
      });
    } else if (state.kind === "type" && state.type !== "object") {
      found.push({
        index: state.index,
        what: "make State an interface that extends Has* contracts from ./state.ts, or type State = object for none",
      });
    } else if (state.kind === "interface" && state.memberCount > 0) {
      const own = state.fields.map((f) => f.name).join(", ") || "members";
      found.push({
        index: state.index,
        what: `move ${own} out of State into Has* contracts in ${REGISTRY}, and extend them`,
      });
    } else if (state.kind === "interface") {
      const other = state.extends.filter((e) => !/^Has[A-Z]/.test(e));
      if (other.length > 0) {
        found.push({
          index: state.index,
          what: `State extends only Has* contracts, not ${other.join(", ")}`,
        });
      }
    }
  }
  return found
    .sort((a, b) => a.index - b.index)
    .map(
      ({ index, what }) =>
        `${path}:${lineOf(source, index)}: state-contracts: ${what}`,
    );
}
