import { ambler } from "../ambler.ts";
import { factory as setupNode } from "../nodes/clone-setup.ts";
import { factory as analyzeNode } from "../nodes/clone-analyze.ts";
import { factory as initSetupNode } from "../nodes/init-setup.ts";
import { factory as initCopyNode } from "../nodes/init-copy.ts";
import { factory as initConfigNode } from "../nodes/init-config.ts";
import { factory as copyNode } from "../nodes/clone-copy.ts";
import { factory as configNode } from "../nodes/clone-config.ts";
import { factory as stopNode } from "../nodes/clone-stop.ts";

export interface State {
  sourceWalkPath: string;
  targetDir: string;
  sourceRoot: string;
  walkName: string;
  artifactType: "walk" | "node" | "util";
  filesToCopy: string[];
  externalDeps?: Record<string, string>;
  isNewProject: boolean;
  error?: string;
}

type NodeId =
  | "SETUP"
  | "ANALYZE"
  | "INIT_SETUP"
  | "INIT_COPY"
  | "INIT_CONFIG"
  | "COPY"
  | "CONFIG"
  | "STOP";

const amble = ambler<State, NodeId>({
  SETUP: () =>
    setupNode({
      onNewProject: "INIT_SETUP",
      onExisting: "ANALYZE",
      onError: "STOP",
    }),
  ANALYZE: () => analyzeNode({ onSuccess: "COPY", onError: "STOP" }),
  INIT_SETUP: () => initSetupNode({ onSuccess: "INIT_COPY", onError: "STOP" }),
  INIT_COPY: () => initCopyNode({ onSuccess: "INIT_CONFIG", onError: "STOP" }),
  INIT_CONFIG: () => initConfigNode({ onSuccess: "ANALYZE", onError: "STOP" }),
  COPY: () => copyNode({ onSuccess: "CONFIG", onError: "STOP" }),
  CONFIG: () => configNode({ onSuccess: "STOP", onError: "STOP" }),
  STOP: () => stopNode({ onDone: null }),
});

if (import.meta.main) {
  const sourceWalkPath = Deno.args[0];
  const targetDir = Deno.args[1];

  if (!sourceWalkPath || !targetDir) {
    console.error(
      "Usage: deno run --allow-read --allow-write walks/clone.ts <source-path> <target-dir>",
    );
    Deno.exit(1);
  }

  let nodeId: NodeId | null = "SETUP";
  let state: State = {
    sourceWalkPath,
    targetDir,
    sourceRoot: "",
    walkName: "",
    artifactType: "walk",
    filesToCopy: [],
    isNewProject: false,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
