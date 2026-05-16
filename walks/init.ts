import { ambler } from "../ambler.ts";
import { factory as setupNode } from "../nodes/init-setup.ts";
import { factory as copyNode } from "../nodes/init-copy.ts";
import { factory as configNode } from "../nodes/init-config.ts";
import { factory as stopNode } from "../nodes/init-stop.ts";

export interface State {
  targetDir: string;
  error?: string;
}

type NodeId = "SETUP" | "COPY" | "CONFIG" | "STOP";

const amble = ambler<State, NodeId>({
  SETUP: () => setupNode({ onSuccess: "COPY", onError: "STOP" }),
  COPY: () => copyNode({ onSuccess: "CONFIG", onError: "STOP" }),
  CONFIG: () => configNode({ onSuccess: "STOP", onError: "STOP" }),
  STOP: () => stopNode({ onDone: null }),
});

if (import.meta.main) {
  const targetDir = Deno.args[0];
  let nodeId: NodeId | null = "SETUP";
  let state: State = {
    targetDir,
  };

  if (!targetDir) {
    console.error(
      "Usage: deno run --allow-write --allow-read walks/init.ts <target-dir>",
    );
    Deno.exit(1);
  }

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
