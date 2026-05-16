import { basename, resolve } from "node:path";
import { NodeFactory } from "../ambler.ts";
import { downloadFile } from "../utils/download_file.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  downloadFile: (url: string, folder: string) => Promise<string>;
  remove: (path: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  downloadFile,
  remove: (path: string) => Deno.remove(path),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const outputFolder = basename(state.m3uFilePath).replace(/\.m3u$/i, "");
  utils.print(
    `Downloading ${state.urls.length} file(s) to ${outputFolder}/...`,
  );

  const localPaths = await Promise.all(
    state.urls.map((url) => utils.downloadFile(url, outputFolder)),
  );

  await utils.remove(state.m3uFilePath);

  const newState = {
    ...state,
    m3uFilePath: `${outputFolder}/playlist.m3u`,
    urls: localPaths.map((p) => `file://${resolve(p)}`),
  };

  return [edges.onSuccess, newState];
};
