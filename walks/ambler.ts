import { ambler } from "../ambler.ts";
import defer * as routerNode from "../nodes/ambler-router.ts";
import defer * as initSetupNode from "../nodes/init-setup.ts";
import defer * as initCopyNode from "../nodes/init-copy.ts";
import defer * as initConfigNode from "../nodes/init-config.ts";
import defer * as initStopNode from "../nodes/init-stop.ts";
import defer * as cloneSetupNode from "../nodes/clone-setup.ts";
import defer * as cloneAnalyzeNode from "../nodes/clone-analyze.ts";
import defer * as cloneCopyNode from "../nodes/clone-copy.ts";
import defer * as cloneConfigNode from "../nodes/clone-config.ts";
import defer * as cloneStopNode from "../nodes/clone-stop.ts";

export interface State {
  action?: string;
  targetDir: string;
  sourceWalkPath: string;
  sourceRoot: string;
  walkName: string;
  artifactType?: "walk" | "node" | "util";
  filesToCopy: string[];
  externalDeps?: Record<string, string>;
  isNewProject?: boolean;
  error?: string;
}

type NodeId =
  | "ROUTE"
  | "INIT_SETUP"
  | "INIT_COPY"
  | "INIT_CONFIG"
  | "INIT_STOP"
  | "CLONE_SETUP"
  | "CLONE_ANALYZE"
  | "CLONE_INIT_SETUP"
  | "CLONE_INIT_COPY"
  | "CLONE_INIT_CONFIG"
  | "CLONE_COPY"
  | "CLONE_CONFIG"
  | "CLONE_STOP";

const amble = ambler<State, NodeId>({
  ROUTE: () =>
    routerNode.factory({
      onInit: "INIT_SETUP",
      onClone: "CLONE_SETUP",
      onError: null,
    }),

  INIT_SETUP: () =>
    initSetupNode.factory({ onSuccess: "INIT_COPY", onError: "INIT_STOP" }),
  INIT_COPY: () =>
    initCopyNode.factory({ onSuccess: "INIT_CONFIG", onError: "INIT_STOP" }),
  INIT_CONFIG: () =>
    initConfigNode.factory({ onSuccess: "INIT_STOP", onError: "INIT_STOP" }),
  INIT_STOP: () => initStopNode.factory({ onDone: null }),

  CLONE_SETUP: () =>
    cloneSetupNode.factory({
      onNewProject: "CLONE_INIT_SETUP",
      onExisting: "CLONE_ANALYZE",
      onError: "CLONE_STOP",
    }),
  CLONE_INIT_SETUP: () =>
    initSetupNode.factory({
      onSuccess: "CLONE_INIT_COPY",
      onError: "CLONE_STOP",
    }),
  CLONE_INIT_COPY: () =>
    initCopyNode.factory({
      onSuccess: "CLONE_INIT_CONFIG",
      onError: "CLONE_STOP",
    }),
  CLONE_INIT_CONFIG: () =>
    initConfigNode.factory({
      onSuccess: "CLONE_ANALYZE",
      onError: "CLONE_STOP",
    }),
  CLONE_ANALYZE: () =>
    cloneAnalyzeNode.factory({
      onSuccess: "CLONE_COPY",
      onError: "CLONE_STOP",
    }),
  CLONE_COPY: () =>
    cloneCopyNode.factory({ onSuccess: "CLONE_CONFIG", onError: "CLONE_STOP" }),
  CLONE_CONFIG: () =>
    cloneConfigNode.factory({ onSuccess: "CLONE_STOP", onError: "CLONE_STOP" }),
  CLONE_STOP: () => cloneStopNode.factory({ onDone: null }),
});

if (import.meta.main) {
  const action = Deno.args[0];

  let state: State = {
    action,
    targetDir: "",
    sourceWalkPath: "",
    sourceRoot: "",
    walkName: "",
    filesToCopy: [],
  };

  switch (action?.toLowerCase()) {
    case "init": {
      const targetDir = Deno.args[1];
      if (!targetDir) {
        console.error("Usage: ambler init <target-dir>");
        Deno.exit(1);
      }
      state = { ...state, targetDir };
      break;
    }
    case "clone": {
      const sourceWalkPath = Deno.args[1];
      const targetDir = Deno.args[2];
      if (!sourceWalkPath || !targetDir) {
        console.error(
          "Usage: ambler clone <source-path> <target-dir>",
        );
        Deno.exit(1);
      }
      state = { ...state, sourceWalkPath, targetDir };
      break;
    }
    default:
      console.error(
        "Usage: ambler <action> [args]\n\n" +
          "Actions:\n" +
          "  init <target-dir>\n" +
          "  clone <source-path> <target-dir>",
      );
      Deno.exit(1);
  }

  let nodeId: NodeId | null = "ROUTE";

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
