import { ambler } from "../ambler.ts";
import { factory as setupNode } from "../nodes/clone-setup.ts";
import { factory as analyzeNode } from "../nodes/clone-analyze.ts";
import { factory as initSetupNode } from "../nodes/init-setup.ts";
import { factory as initCopyNode } from "../nodes/init-copy.ts";
import { factory as initConfigNode } from "../nodes/init-config.ts";
import { factory as copyNode } from "../nodes/clone-copy.ts";
import { factory as stopNode } from "../nodes/clone-stop.ts";

export interface State {
  sourceWalk: string;
  targetDir: string;
  filesToCopy: string[];
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
  COPY: () => copyNode({ onSuccess: "STOP", onError: "STOP" }),
  STOP: () => stopNode({ onDone: null }),
});

export async function run(args: string[]) {
  const sourceWalk = args[0];
  const targetDir = args[1];
  if (!sourceWalk || !targetDir) {
    console.error("Usage: ambler clone <source-walk> <target-dir>");
    Deno.exit(1);
  }
  let nodeId: NodeId | null = "SETUP";
  let state: State = {
    sourceWalk,
    targetDir,
    filesToCopy: [],
    isNewProject: false,
  };
  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}

if (import.meta.main) {
  await run(Deno.args);
}
