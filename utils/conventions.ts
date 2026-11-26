/**
 * The structural conventions `check` verifies before running the tools. Pure
 * functions over source text: each returns `<path>:<line>: <rule>: <what to do>`
 * lines, one per violation.
 */

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
