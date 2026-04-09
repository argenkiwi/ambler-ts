import { Next, Nextable } from "../ambler.ts";
import { basename } from "https://deno.land/std@0.224.0/path/mod.ts";
import { downloadFile } from "../utils/download_file.ts";

export namespace DownloadFilesNode {
  export interface State {
    m3uFilePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onSuccess: Nextable<S>;
  };

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

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
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
        urls: localPaths.map((p) => `file://${p}`),
      };

      return new Next(edges.onSuccess, newState);
    };
  }
}
