import { amble, Node } from "../ambler.ts";
import * as StartNode from "../nodes/startNode.ts";
import * as CountNode from "../nodes/countNode.ts";
import * as StopNode from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const initialState: State = {
  count: 0,
};

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: StartNode.create<State, NodeId>({ onSuccess: "count", onError: "start" }),
  count: CountNode.create<State, NodeId>({ onCount: "count", onStop: "stop" }),
  stop: StopNode.create<State, NodeId>({ onDone: null }),
};

if (import.meta.main) {
  await amble<State, NodeId>(nodes, "start", initialState);
}
