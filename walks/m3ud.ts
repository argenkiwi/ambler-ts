import { amble, node, Nextable } from "../ambler.ts";
import * as CheckM3UFileNode from "../nodes/checkM3UFileNode.ts";
import * as ReadM3UFileNode from "../nodes/readM3UFileNode.ts";
import * as PromptResolveNode from "../nodes/promptResolveNode.ts";
import * as ResolveUrlsNode from "../nodes/resolveUrlsNode.ts";
import * as SaveM3UFileNode from "../nodes/saveM3UFileNode.ts";
import * as PromptDownloadNode from "../nodes/promptDownloadNode.ts";
import * as DownloadFilesNode from "../nodes/downloadFilesNode.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

const initialState: State = {
  m3uFilePath: "",
  urls: [],
};

const terminate: Nextable<State> = async () => null;

const nodes: Record<string, Nextable<State>> = {
  checkM3UFile: node(() =>
    CheckM3UFileNode.create({ onSuccess: nodes.readM3UFile })
  ),
  readM3UFile: node(() =>
    ReadM3UFileNode.create({
      onHasKhinsider: nodes.promptResolve,
      onNoKhinsider: nodes.promptDownload,
    })
  ),
  promptResolve: node(() =>
    PromptResolveNode.create({ onYes: nodes.resolveUrls })
  ),
  resolveUrls: node(() =>
    ResolveUrlsNode.create({ onSuccess: nodes.saveAfterResolve })
  ),
  saveAfterResolve: node(() =>
    SaveM3UFileNode.create({ onSuccess: nodes.promptDownload })
  ),
  promptDownload: node(() =>
    PromptDownloadNode.create({ onYes: nodes.downloadFiles })
  ),
  downloadFiles: node(() =>
    DownloadFilesNode.create({ onSuccess: nodes.saveAfterDownload })
  ),
  saveAfterDownload: node(() =>
    SaveM3UFileNode.create({ onSuccess: terminate })
  ),
};

if (import.meta.main) {
  await amble(nodes.checkM3UFile, initialState);
}
