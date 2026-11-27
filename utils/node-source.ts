/**
 * Pure readers of an existing node's source: the fields and contracts of its
 * `State`, the names in its `Edge` union and the names it exports; and of the
 * state registry, `nodes/state.ts`. Good enough for files written by
 * `ambler node` and formatted by Biome; not a TypeScript parser.
 */

import { dirname, relative } from "node:path";

export interface Field {
  name: string;
  type: string;
  optional: boolean;
}

export interface NodeSource {
  /** Fields the `State` declares itself, which the conventions forbid. */
  state: Field[];
  /** The `Has*` contracts the `State` extends. */
  contracts: string[];
  edges: string[];
  exports: string[];
}

/** Built-in and global type names that never need an import. */
const GLOBAL_TYPES = new Set([
  "Array",
  "ReadonlyArray",
  "Record",
  "Partial",
  "Required",
  "Readonly",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "ReturnType",
  "Parameters",
  "Awaited",
  "Map",
  "Set",
  "ReadonlyMap",
  "ReadonlySet",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Date",
  "Error",
  "RegExp",
  "URL",
  "Uint8Array",
]);

/**
 * Blanks out comments and, unless `keepStrings`, string contents, keeping
 * offsets and quotes.
 */
function mask(src: string, keepStrings = false): string {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") {
        out += " ";
        i++;
      }
    } else if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else if (c === '"' || c === "'" || c === "`") {
      out += c;
      i++;
      while (i < src.length && src[i] !== c) {
        if (src[i] === "\\") {
          out += keepStrings ? src[i] : " ";
          i++;
        }
        out += keepStrings || src[i] === "\n" ? src[i] : " ";
        i++;
      }
      if (i < src.length) out += c;
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** Splits `text` at `seps` that are not nested in brackets. */
function splitTopLevel(text: string, seps: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ("{[(<".includes(c)) depth++;
    else if ("}])".includes(c) || (c === ">" && text[i - 1] !== "=")) depth--;
    else if (depth === 0 && seps.includes(c)) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Index just past the bracket that closes the one at `open`. */
function closing(masked: string, open: number): number {
  let depth = 0;
  for (let i = open; i < masked.length; i++) {
    if (masked[i] === "{") depth++;
    else if (masked[i] === "}" && --depth === 0) return i + 1;
  }
  return masked.length;
}

function normalizeType(type: string): string {
  return type
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\|\s*/, "")
    .replace(/;\s*\}/g, " }");
}

/**
 * The members of the object type whose `{` is at `open`: the property fields,
 * and how many members of any kind (methods and index signatures included).
 */
function members(
  src: string,
  masked: string,
  open: number,
): { fields: Field[]; count: number } {
  const end = closing(masked, open);
  const body = src.slice(open + 1, end - 1);
  const maskedBody = masked.slice(open + 1, end - 1);

  const fields: Field[] = [];
  let count = 0;
  let offset = 0;
  for (const part of splitTopLevel(maskedBody, ";,")) {
    const raw = body.slice(offset, offset + part.length);
    offset += part.length + 1;
    if (part.trim()) count++;
    const m = /^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)(\?)?\s*:([\s\S]+)$/.exec(
      raw,
    );
    if (m) {
      fields.push({
        name: m[1],
        type: normalizeType(m[3]),
        optional: m[2] === "?",
      });
    }
  }
  return { fields, count };
}

/** A top-level `interface` or `type` declaration. */
export interface Declaration {
  name: string;
  kind: "interface" | "type";
  exported: boolean;
  /** The base type names an interface extends, without type arguments. */
  extends: string[];
  /** The property fields of an interface or object type literal. */
  fields: Field[];
  /** Every member of an interface or object type literal, fields or not. */
  memberCount: number;
  /** A type alias's type, whitespace normalised. */
  type?: string;
  /** Offset of the declaration in the source. */
  index: number;
}

/** Every `interface` and `type` declaration in `src`, in source order. */
export function declarations(src: string): Declaration[] {
  const masked = mask(src);
  const plain = mask(src, true);
  const found: Declaration[] = [];
  for (const m of masked.matchAll(
    /(?<![\w$.])(export\s+)?(?:declare\s+)?(interface|type)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    const after = m.index + m[0].length;
    const decl: Declaration = {
      name: m[3],
      kind: m[2] as "interface" | "type",
      exported: Boolean(m[1]),
      extends: [],
      fields: [],
      memberCount: 0,
      index: m.index,
    };
    if (decl.kind === "interface") {
      const open = masked.indexOf("{", after);
      if (open < 0) continue;
      const heading = masked.slice(after, open);
      const ext = /\bextends\b([\s\S]*)$/.exec(heading);
      if (ext) {
        decl.extends = splitTopLevel(ext[1], ",")
          .map((b) => /^\s*([A-Za-z_$][\w$.]*)/.exec(b)?.[1] ?? "")
          .filter(Boolean);
      }
      const body = members(plain, masked, open);
      decl.fields = body.fields;
      decl.memberCount = body.count;
    } else {
      const eq = /^\s*(?:<[^=]*>)?\s*=/.exec(masked.slice(after));
      if (!eq) continue;
      const start = after + eq[0].length;
      const [alias] = splitTopLevel(masked.slice(start), ";");
      decl.type = normalizeType(plain.slice(start, start + alias.length));
      const open = start + alias.length - alias.trimStart().length;
      if (masked[open] === "{") {
        const body = members(plain, masked, open);
        decl.fields = body.fields;
        decl.memberCount = body.count;
      }
    }
    found.push(decl);
  }
  return found;
}

function stateDeclaration(src: string): Declaration | undefined {
  return declarations(src).find((d) => d.exported && d.name === "State");
}

function edgeNames(src: string, masked: string): string[] {
  const head = /export\s+type\s+Edge\s*=/.exec(masked);
  if (!head) return [];
  const start = head.index + head[0].length;
  const [union] = splitTopLevel(masked.slice(start), ";");
  const text = src.slice(start, start + union.length);
  return [...text.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
}

/**
 * Reads the `State` fields and contracts, `Edge` names and exported names of
 * a node.
 */
export function parseNode(src: string): NodeSource {
  const masked = mask(src);
  const plain = mask(src, true);
  const exports = [
    ...masked.matchAll(
      /export\s+(?:declare\s+)?(?:type|interface|enum|class|const|function)\s+([A-Za-z_$][\w$]*)/g,
    ),
  ].map((m) => m[1]);
  const state = stateDeclaration(src);
  return {
    state: state?.fields ?? [],
    contracts: state?.extends ?? [],
    edges: edgeNames(plain, masked),
    exports,
  };
}

/** The state registry: every `Has*` contract of the project lives here. */
export const REGISTRY = "nodes/state.ts";

/** A state contract: `export interface HasCount { count: number }`. */
export interface Contract {
  /** `Has` and the field's name in PascalCase. */
  name: string;
  field: Field;
}

/** The contract name for the camelCase `field`: `count` is `HasCount`. */
export function contractName(field: string): string {
  return `Has${field.charAt(0).toUpperCase()}${field.slice(1)}`;
}

/** The `Has*` interfaces of the registry with their one field each. */
export function parseRegistry(src: string): Contract[] {
  return declarations(src)
    .filter(
      (d) =>
        d.kind === "interface" &&
        /^Has[A-Z]/.test(d.name) &&
        d.fields.length > 0,
    )
    .map((d) => ({ name: d.name, field: d.fields[0] }));
}

/** The type names `src` imports, with the module each comes from. */
function importedTypes(src: string): { names: string[]; spec: string }[] {
  return [
    ...mask(src, true).matchAll(
      /import\s+type\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];?/g,
    ),
  ].map((m) => ({
    names: m[1]
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean),
    spec: m[2],
  }));
}

/**
 * The registry `src` (empty for a new one) with `contracts` appended, and an
 * `import type` for each name in `imports` it neither imports nor declares.
 * `imports` give project-relative files, seen from `nodes/state.ts`.
 */
export function appendContracts(
  src: string,
  contracts: Contract[],
  imports: { name: string; file: string }[],
): string {
  const known = new Set([
    ...importedTypes(src).flatMap((i) => i.names),
    ...declarations(src).map((d) => d.name),
  ]);
  let head = src;
  for (const { name, file } of imports) {
    if (known.has(name)) continue;
    known.add(name);
    let spec = relative(dirname(REGISTRY), file);
    if (!spec.startsWith(".")) spec = `./${spec}`;
    const same = new RegExp(
      `import\\s+type\\s*\\{([^}]*)\\}(\\s*from\\s*["']${spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'])`,
    ).exec(head);
    if (same) {
      const names = `${same[1].trim()}, ${name}`;
      head =
        head.slice(0, same.index) +
        `import type { ${names} }${same[2]}` +
        head.slice(same.index + same[0].length);
      continue;
    }
    const line = `import type { ${name} } from "${spec}";\n`;
    const lastImport = [...head.matchAll(/^import\s[^;]*;[^\n]*\n/gm)].at(-1);
    const at = lastImport ? lastImport.index + lastImport[0].length : 0;
    head = head.slice(0, at) + line + head.slice(at);
  }
  const body = contracts
    .map(
      ({ name, field }) =>
        `export interface ${name} {\n  ${field.name}${field.optional ? "?" : ""}: ${field.type};\n}\n`,
    )
    .join("\n");
  const kept = head.replace(/\s*$/, "");
  return kept ? `${kept}\n\n${body}` : body;
}

/**
 * Capitalised type names a type refers to that are not built in, such as
 * `Board` in `Board | null`. Property names and string literals are skipped.
 */
export function typeNames(type: string): string[] {
  const names = new Set<string>();
  for (const m of mask(type).matchAll(/(?<![\w$.])([A-Z][\w$]*)(?!\s*\??:)/g)) {
    if (!GLOBAL_TYPES.has(m[1])) names.add(m[1]);
  }
  return [...names];
}

/** The parsed `.ts` files directly in `dir`, in path order. */
export function readSources(
  fs: {
    listFiles: (dir: string) => string[];
    readFile: (path: string) => string;
  },
  dir: string,
): { file: string; source: NodeSource }[] {
  return fs
    .listFiles(dir)
    .map((file) => ({ file, source: parseNode(fs.readFile(file)) }));
}

/**
 * Where to import each named type the `types` refer to: the first file in
 * `exporters` that exports it. Names no file exports are `missing`.
 */
export function findTypeImports(
  types: string[],
  exporters: { file: string; source: NodeSource }[],
): { imports: { name: string; file: string }[]; missing: string[] } {
  const imports: { name: string; file: string }[] = [];
  const missing: string[] = [];
  for (const name of new Set(types.flatMap(typeNames))) {
    const from = exporters.find(({ source }) => source.exports.includes(name));
    if (from) imports.push({ name, file: from.file });
    else missing.push(name);
  }
  return { imports, missing };
}
