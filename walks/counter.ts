import { ambler, stateAdapter } from "../ambler.ts";
import startNode from "../nodes/startNode.ts";
import countNode from "../nodes/countNode.ts";
import stopNode from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const amble = ambler<State, NodeId>((bind) => ({
  start: bind(
    startNode,
    { onSuccess: "count", onError: "start" },
    stateAdapter(
      (state) => ({ count: state.count }),
      (state, nodeState) => ({ ...state, count: nodeState.count }),
    ),
  ),
  count: bind(countNode, { onCount: "count", onStop: "stop" }),
  stop: bind(stopNode, { onDone: null }),
}));

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    count: 0,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = typeof next === "function" ? next : await next;
  }
}
