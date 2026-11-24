import { existsSync, mkdirSync, writeFileSync } from "node:fs";

/** File-system and output capabilities shared by the scaffolding nodes. */
export interface ScaffoldUtils {
  exists: (path: string) => boolean;
  mkdir: (path: string) => void;
  writeFile: (path: string, content: string) => void;
  print: (msg: string) => void;
  printError: (msg: string) => void;
}

export const defaultScaffoldUtils: ScaffoldUtils = {
  exists: (path) => existsSync(path),
  mkdir: (path) => {
    mkdirSync(path, { recursive: true });
  },
  writeFile: (path, content) => writeFileSync(path, content),
  print: (msg) => console.log(msg),
  printError: (msg) => console.error(msg),
};
