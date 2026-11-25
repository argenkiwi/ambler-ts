/**
 * Pure readers of an existing node's source: the fields of its `State`, the
 * names in its `Edge` union and the names it exports. Good enough for files
 * written by `ambler node` and formatted by Biome; not a TypeScript parser.
 */

export interface Field {
  name: string;
  type: string;
  optional: boolean;
}

export interface NodeSource {
  state: Field[];
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

function stateFields(src: string, masked: string): Field[] {
  const head =
    /export\s+(?:interface\s+State\b[^{]*|type\s+State\s*=\s*)\{/.exec(masked);
  if (!head) return [];
  const open = head.index + head[0].length - 1;
  const end = closing(masked, open);
  const body = src.slice(open + 1, end - 1);
  const maskedBody = masked.slice(open + 1, end - 1);

  const fields: Field[] = [];
  let offset = 0;
  for (const part of splitTopLevel(maskedBody, ";,")) {
    const raw = body.slice(offset, offset + part.length);
    offset += part.length + 1;
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
  return fields;
}

function edgeNames(src: string, masked: string): string[] {
  const head = /export\s+type\s+Edge\s*=/.exec(masked);
  if (!head) return [];
  const start = head.index + head[0].length;
  const [union] = splitTopLevel(masked.slice(start), ";");
  const text = src.slice(start, start + union.length);
  return [...text.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
}

/** Reads the `State` fields, `Edge` names and exported names of a node. */
export function parseNode(src: string): NodeSource {
  const masked = mask(src);
  const plain = mask(src, true);
  const exports = [
    ...masked.matchAll(
      /export\s+(?:declare\s+)?(?:type|interface|enum|class|const|function)\s+([A-Za-z_$][\w$]*)/g,
    ),
  ].map((m) => m[1]);
  return {
    state: stateFields(plain, masked),
    edges: edgeNames(plain, masked),
    exports,
  };
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
