import { adapt, ambler, defer } from "../ambler.ts";
import { factory as startNodeFactory } from "../nodes/startNode.ts";
import { factory as countNodeFactory } from "../nodes/countNode.ts";
import { factory as stopNodeFactory } from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const countNode = defer(() =>
  countNodeFactory<NodeId>({ onCount: "count", onStop: "stop" })
);

const amble = ambler<State, NodeId>({
  start: adapt(
    startNodeFactory({ onSuccess: "count", onError: "start" }),
    () => {},
    (state, output) => ({ ...state, count: output.count }),
  ),
  count: async (state) => {
    const [nodeId, output] = await countNode(state.count);
    return [nodeId, { ...state, count: output }];
  },
  stop: adapt(
    stopNodeFactory<NodeId>({ onDone: null }),
    (state) => ({ count: state.count }),
    (state) => state,
  ),
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
