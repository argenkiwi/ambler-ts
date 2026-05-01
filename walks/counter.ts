import { ambler, Node } from "../ambler.ts";
import * as StartNode from "../nodes/startNode.ts";
import * as CountNode from "../nodes/countNode.ts";
import * as StopNode from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: StartNode.create<State, NodeId>({ onSuccess: "count", onError: "start" }),
  count: CountNode.create<State, NodeId>({ onCount: "count", onStop: "stop" }),
  stop: StopNode.create<State, NodeId>({ onDone: null }),
};

const amble = ambler(nodes);

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
