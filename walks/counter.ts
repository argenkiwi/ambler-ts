import { ambler } from "../ambler.ts";
import defer * as startNode from "../nodes/start.ts";
import defer * as countNode from "../nodes/count.ts";
import defer * as stopNode from "../nodes/stop.ts";

export interface State {
  count: number;
}

type NodeId = "START" | "COUNT" | "STOP";

const amble = ambler<State, NodeId>({
  START: () => startNode.factory({ onSuccess: "COUNT", onError: "START" }),
  COUNT: () => countNode.factory({ onCount: "COUNT", onStop: "STOP" }),
  STOP: () => stopNode.factory({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "START";
  let state: State = {
    count: 0,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
