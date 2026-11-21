import { ambler, walk } from "../ambler.ts";
import type { Utils as ConfigUtils } from "../nodes/init-config.ts";
import defer * as configNode from "../nodes/init-config.ts";
import type { Utils as CopyUtils } from "../nodes/init-copy.ts";
import defer * as copyNode from "../nodes/init-copy.ts";
import type { Utils as SetupUtils } from "../nodes/init-setup.ts";
import defer * as setupNode from "../nodes/init-setup.ts";
import type { Utils as StopUtils } from "../nodes/init-stop.ts";
import defer * as stopNode from "../nodes/init-stop.ts";

export interface State {
  targetDir: string;
  error?: string;
}

export type NodeId = "SETUP" | "COPY" | "CONFIG" | "STOP";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  setup?: SetupUtils;
  copy?: CopyUtils;
  config?: ConfigUtils;
  stop?: StopUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    SETUP: () =>
      setupNode.factory({ onSuccess: "COPY", onError: "STOP" }, utils.setup),
    COPY: () =>
      copyNode.factory({ onSuccess: "CONFIG", onError: "STOP" }, utils.copy),
    CONFIG: () =>
      configNode.factory({ onSuccess: "STOP", onError: "STOP" }, utils.config),
    STOP: () => stopNode.factory({ onDone: null }, utils.stop),
  });
}

if (import.meta.main) {
  const targetDir = process.argv.slice(2)[0];

  if (!targetDir) {
    console.error("Usage: bun walks/init.ts <target-dir>");
    process.exit(1);
  }

  const final = await walk(createWalk(), "SETUP", { targetDir });
  if (final.error) process.exit(1);
}
