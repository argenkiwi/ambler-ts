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
  | "CHECK_M3U_FILE"
  | "READ_M3U_FILE"
  | "PROMPT_RESOLVE"
  | "RESOLVE_URLS"
  | "SAVE_AFTER_RESOLVE"
  | "PROMPT_DOWNLOAD"
  | "DOWNLOAD_FILES"
  | "SAVE_AFTER_DOWNLOAD";

const amble = ambler<State, NodeId>({
  CHECK_M3U_FILE: () => checkM3UFileNode({ onSuccess: "READ_M3U_FILE" }),
  READ_M3U_FILE: () =>
    readM3UFileNode({
      onHasKhinsider: "PROMPT_RESOLVE",
      onNoKhinsider: "PROMPT_DOWNLOAD",
    }),
  PROMPT_RESOLVE: () => promptResolveNode({ onYes: "RESOLVE_URLS" }),
  RESOLVE_URLS: () => resolveUrlsNode({ onSuccess: "SAVE_AFTER_RESOLVE" }),
  SAVE_AFTER_RESOLVE: () => saveM3UFileNode({ onSuccess: "PROMPT_DOWNLOAD" }),
  PROMPT_DOWNLOAD: () => promptDownloadNode({ onYes: "DOWNLOAD_FILES" }),
  DOWNLOAD_FILES: () => downloadFilesNode({ onSuccess: "SAVE_AFTER_DOWNLOAD" }),
  SAVE_AFTER_DOWNLOAD: () => saveM3UFileNode({ onSuccess: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "CHECK_M3U_FILE";
  let state: State = {
    m3uFilePath: "",
    urls: [],
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
