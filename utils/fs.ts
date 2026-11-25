import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

/** File-system and output capabilities shared by the scaffolding nodes. */
export interface ScaffoldUtils {
  exists: (path: string) => boolean;
  mkdir: (path: string) => void;
  writeFile: (path: string, content: string) => void;
  readFile: (path: string) => string;
  /** Paths (`dir/name.ts`) of the `.ts` files directly in `dir`, sorted. */
  listFiles: (dir: string) => string[];
  /**
   * Applies the project's own Biome formatting and safe fixes (such as import
   * order) to freshly written files, so they pass its lint unchanged. Does
   * nothing when the project has no Biome.
   */
  format: (paths: string[]) => void;
  print: (msg: string) => void;
  printError: (msg: string) => void;
}

export const defaultScaffoldUtils: ScaffoldUtils = {
  exists: (path) => existsSync(path),
  mkdir: (path) => {
    mkdirSync(path, { recursive: true });
  },
  writeFile: (path, content) => writeFileSync(path, content),
  readFile: (path) => readFileSync(path, "utf8"),
  listFiles: (dir) =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".ts"))
          .sort()
          .map((f) => join(dir, f))
      : [],
  format: (paths) => {
    const biome = join("node_modules", ".bin", "biome");
    if (paths.length === 0 || !existsSync(biome)) return;
    Bun.spawnSync([biome, "check", "--write", ...paths], {
      stdout: "ignore",
      stderr: "ignore",
    });
  },
  print: (msg) => console.log(msg),
  printError: (msg) => console.error(msg),
};
