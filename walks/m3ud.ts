import { amble, node, Nextable } from "../ambler.ts";
import { CheckM3uFileNode } from "../nodes/checkM3uFileNode.ts";
import { PromptM3uFileNode } from "../nodes/promptM3uFileNode.ts";
import { ReadM3uFileNode } from "../nodes/readM3uFileNode.ts";
import { PromptOptionsNode } from "../nodes/promptOptionsNode.ts";
import { ListUrlsNode } from "../nodes/listUrlsNode.ts";
import { ResolveUrlsNode } from "../nodes/resolveUrlsNode.ts";
import { SaveM3uFileNode } from "../nodes/saveM3uFileNode.ts";
import { DownloadFilesNode } from "../nodes/downloadFilesNode.ts";

export interface State {
  filePath: string;
  urls: string[];
}

const initialState: State = {
  filePath: "",
  urls: [],
};

const nodes: Record<string, Nextable<State>> = {
  checkM3uFile: node(() =>
    CheckM3uFileNode.create({
      onValid: nodes.readM3uFile,
      onInvalid: nodes.promptM3uFile,
    })
  ),
  promptM3uFile: node(() =>
    PromptM3uFileNode.create({
      onEntered: nodes.checkM3uFile,
    })
  ),
  readM3uFile: node(() =>
    ReadM3uFileNode.create({
      onRead: nodes.promptOptions,
    })
  ),
  promptOptions: node(() =>
    PromptOptionsNode.create({
      onList: nodes.listUrls,
      onResolve: nodes.resolveUrls,
      onDownload: nodes.downloadFiles,
    })
  ),
  listUrls: node(() =>
    ListUrlsNode.create({
      onDone: nodes.promptOptions,
    })
  ),
  resolveUrls: node(() =>
    ResolveUrlsNode.create({
      onDone: nodes.saveM3uFile,
    })
  ),
  saveM3uFile: node(() =>
    SaveM3uFileNode.create({
      onSaved: nodes.promptOptions,
    })
  ),
  downloadFiles: node(() => DownloadFilesNode.create()),
};

if (import.meta.main) {
  await amble(nodes.checkM3uFile, initialState);
}
