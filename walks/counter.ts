import { amble, node, Nextable } from "../ambler.ts";
import * as StartNode from "../nodes/startNode.ts";
import * as CountNode from "../nodes/countNode.ts";
import * as StopNode from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

// Wire the graph using a record to store node factories
const nodes: Record<string, Nextable<State>> = {
  start: node(() => StartNode.create({ onSuccess: nodes.count, onError: nodes.start })),
  count: node(() => CountNode.create({ onCount: nodes.count, onStop: nodes.stop })),
  stop: node(() => StopNode.create()),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
