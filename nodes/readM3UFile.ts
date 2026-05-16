import { NodeFactory } from "../ambler.ts";

const KHINSIDER_PREFIX = "https://downloads.khinsider.com/game-soundtracks";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onHasKhinsider" | "onNoKhinsider";

export type Utils = {
  readFile: (path: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readFile: (path: string) => Deno.readTextFile(path),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const content = await utils.readFile(state.m3uFilePath);
  const urls = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  utils.print(`Found ${urls.length} URL(s):`);
  urls.forEach((url) => utils.print(`  ${url}`));

  const nextState = { ...state, urls };
  if (urls.some((url) => url.startsWith(KHINSIDER_PREFIX))) {
    return [edges.onHasKhinsider, nextState];
  }

  return [edges.onNoKhinsider, nextState];
};
