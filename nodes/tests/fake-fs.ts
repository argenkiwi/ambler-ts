import type { ScaffoldUtils } from "../../utils/fs.ts";

/**
 * In-memory ScaffoldUtils for tests; records files, formatted paths, output
 * and errors.
 */
export function fakeFs(initial: Record<string, string> = {}) {
  const files = new Map(Object.entries(initial));
  const formatted: string[] = [];
  const out: string[] = [];
  const errors: string[] = [];
  const utils: ScaffoldUtils = {
    exists: (p) => files.has(p),
    mkdir: () => {},
    writeFile: (p, c) => {
      files.set(p, c);
    },
    format: (paths) => {
      formatted.push(...paths);
    },
    print: (m) => out.push(m),
    printError: (m) => errors.push(m),
  };
  return { files, formatted, out, errors, utils };
}
