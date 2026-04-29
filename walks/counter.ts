import { amble, Node } from "../ambler.ts";
import * as StartNode from "../nodes/startNode.ts";
import * as CountNode from "../nodes/countNode.ts";
import * as StopNode from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: StartNode.create({ onSuccess: "count", onError: "start" }),
  count: CountNode.create({ onCount: "count", onStop: "stop" }),
  stop: StopNode.create<State, NodeId>({ onDone: null }),
};

const initialState: State = {
  count: 0,
};

if (import.meta.main) {
  await amble(nodes, "start", initialState);
}
