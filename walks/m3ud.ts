import { ambler } from "../ambler.ts";
import { factory as checkM3UFileNode } from "../nodes/checkM3UFile.ts";
import { factory as readM3UFileNode } from "../nodes/readM3UFile.ts";
import { factory as promptResolveNode } from "../nodes/promptResolve.ts";
import { factory as resolveUrlsNode } from "../nodes/resolveUrls.ts";
import { factory as saveM3UFileNode } from "../nodes/saveM3UFile.ts";
import { factory as promptDownloadNode } from "../nodes/promptDownload.ts";
import { factory as downloadFilesNode } from "../nodes/downloadFiles.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

type NodeId =
  | "checkM3UFile"
  | "readM3UFile"
  | "promptResolve"
  | "resolveUrls"
  | "saveAfterResolve"
  | "promptDownload"
  | "downloadFiles"
  | "saveAfterDownload";

const amble = ambler<State, NodeId>({
  checkM3UFile: () => checkM3UFileNode({ onSuccess: "readM3UFile" }),
  readM3UFile: () =>
    readM3UFileNode({
      onHasKhinsider: "promptResolve",
      onNoKhinsider: "promptDownload",
    }),
  promptResolve: () => promptResolveNode({ onYes: "resolveUrls" }),
  resolveUrls: () => resolveUrlsNode({ onSuccess: "saveAfterResolve" }),
  saveAfterResolve: () => saveM3UFileNode({ onSuccess: "promptDownload" }),
  promptDownload: () => promptDownloadNode({ onYes: "downloadFiles" }),
  downloadFiles: () => downloadFilesNode({ onSuccess: "saveAfterDownload" }),
  saveAfterDownload: () => saveM3UFileNode<NodeId>({ onSuccess: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "checkM3UFile";
  let state: State = {
    m3uFilePath: "",
    urls: [],
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
