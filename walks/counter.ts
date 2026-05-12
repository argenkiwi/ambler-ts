import { ambler } from "../ambler.ts";
import { factory as startNode } from "../nodes/start.ts";
import { factory as countNode } from "../nodes/count.ts";
import { factory as stopNode } from "../nodes/stop.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const amble = ambler<State, NodeId>({
  start: () => startNode({ onSuccess: "count", onError: "start" }),
  count: () => countNode({ onCount: "count", onStop: "stop" }),
  stop: () => stopNode<NodeId, State>({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    count: 0,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
