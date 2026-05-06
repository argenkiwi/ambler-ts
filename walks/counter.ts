import { ambler } from "../ambler.ts";
import { factory as startNodeFactory } from "../nodes/startNode.ts";
import { factory as countNodeFactory } from "../nodes/countNode.ts";
import { factory as stopNodeFactory } from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const startNode = startNodeFactory<NodeId>({
  onSuccess: "count",
  onError: "start",
});

const countNode = countNodeFactory<NodeId>({
  onCount: "count",
  onStop: "stop",
});

const stopNode = stopNodeFactory<NodeId>({ onDone: null });

const amble = ambler<State, NodeId>({
  start: (state) => {
    const [nodeId, output] = startNode();
    return [nodeId, { ...state, count: output }];
  },
  count: async (state) => {
    const [nodeId, output] = await countNode(state.count);
    return [nodeId, { ...state, count: output }];
  },
  stop: (state) => {
    const [nodeId, _] = stopNode(state.count);
    return [nodeId, state];
  },
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
