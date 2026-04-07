import { Nextable } from "../ambler.ts";
import { downloadFile } from "../utils/download_files.ts";

export namespace DownloadFilesNode {
  export interface State {
    filePath: string;
    urls: string[];
  }

  export type Utils = {
    downloadFile: (url: string, folder: string) => Promise<void>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    downloadFile,
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<null> => {
      const folder =
        state.filePath.replace(/\\/g, "/").split("/").pop()?.replace(/\.m3u$/i, "") ??
        "downloads";
      utils.print(`Downloading ${state.urls.length} file(s) to "${folder}"...`);
      await Promise.all(state.urls.map((url) => utils.downloadFile(url, folder)));
      utils.print("All downloads complete.");
      return null;
    };
  }
}
