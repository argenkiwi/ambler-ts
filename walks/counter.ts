import { amble, Node } from "../ambler.ts";
import * as StartNode from "../nodes/startNode.ts";
import * as CountNode from "../nodes/countNode.ts";
import * as StopNode from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

// Wire the graph using a record to store nodes
const nodes: Record<string, Node<State>> = {
  start: StartNode.create({ onSuccess: "count", onError: "start" }),
  count: CountNode.create({ onCount: "count", onStop: "stop" }),
  stop: StopNode.create({ onDone: null }),
};

if (import.meta.main) {
  await amble(nodes, "start", initialState);
}
