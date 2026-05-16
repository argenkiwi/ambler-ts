import { ambler } from "../ambler.ts";
import { factory as setupNode } from "../nodes/clone-setup.ts";
import { factory as analyzeNode } from "../nodes/clone-analyze.ts";
import { factory as initNode } from "../nodes/clone-init.ts";
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
  | "setup"
  | "analyze"
  | "init"
  | "init-setup"
  | "init-copy"
  | "init-config"
  | "copy"
  | "stop";

const amble = ambler<State, NodeId>({
  setup: () => setupNode({ onSuccess: "analyze", onError: "stop" }),
  analyze: () => analyzeNode({ onSuccess: "init", onError: "stop" }),
  init: () => initNode({ onNewProject: "init-setup", onExisting: "copy" }),
  "init-setup": () => initSetupNode({ onSuccess: "init-copy", onError: "stop" }),
  "init-copy": () => initCopyNode({ onSuccess: "init-config", onError: "stop" }),
  "init-config": () => initConfigNode({ onSuccess: "copy", onError: "stop" }),
  copy: () => copyNode({ onSuccess: "stop", onError: "stop" }),
  stop: () => stopNode({ onDone: null }),
});

if (import.meta.main) {
  const sourceWalk = Deno.args[0];
  const targetDir = Deno.args[1];

  if (!sourceWalk || !targetDir) {
    console.error(
      "Usage: deno run --allow-all walks/clone.ts <source-walk> <target-dir>",
    );
    Deno.exit(1);
  }

  let nodeId: NodeId | null = "setup";
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
