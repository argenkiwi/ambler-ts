import { ambler, walk } from "../ambler.ts";
import type { Utils as CountUtils } from "../nodes/count.ts";
import defer * as countNode from "../nodes/count.ts";
import type { Utils as StartUtils } from "../nodes/start.ts";
import defer * as startNode from "../nodes/start.ts";
import type { Utils as StopUtils } from "../nodes/stop.ts";
import defer * as stopNode from "../nodes/stop.ts";

export interface State {
  count: number;
}

export type NodeId = "START" | "COUNT" | "STOP";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  start?: StartUtils;
  count?: CountUtils;
  stop?: StopUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    START: () =>
      startNode.factory({ onSuccess: "COUNT", onError: "START" }, utils.start),
    COUNT: () =>
      countNode.factory({ onCount: "COUNT", onStop: "STOP" }, utils.count),
    STOP: () => stopNode.factory({ onDone: null }, utils.stop),
  });
}

if (import.meta.main) {
  await walk(createWalk(), "START", { count: 0 });
}
