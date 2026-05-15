import { ambler } from "../ambler.ts";
import { factory as setupNode } from "../nodes/init-setup.ts";
import { factory as copyNode } from "../nodes/init-copy.ts";
import { factory as configNode } from "../nodes/init-config.ts";
import { factory as stopNode } from "../nodes/init-stop.ts";

export interface State {
  targetDir: string;
  error?: string;
}

type NodeId = "setup" | "copy" | "config" | "stop";

const amble = ambler<State, NodeId>({
  setup: () => setupNode({ onSuccess: "copy", onError: "stop" }),
  copy: () => copyNode({ onSuccess: "config", onError: "stop" }),
  config: () => configNode({ onSuccess: "stop", onError: "stop" }),
  stop: () => stopNode({ onDone: null }),
});

if (import.meta.main) {
  const targetDir = Deno.args[0];
  let nodeId: NodeId | null = "setup";
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
