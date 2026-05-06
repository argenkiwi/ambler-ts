import { ambler, Node } from "../ambler.ts";
import { factory as startCore } from "../cores/start.ts";
import { factory as countCore } from "../cores/count.ts";
import { factory as stopCore } from "../cores/stop.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const startNode = (): Node<State, NodeId> => {
  const core = startCore<NodeId>({
    onSuccess: "count",
    onError: "start",
  });

  return (state: State) => {
    const [nodeId, output] = core();
    return [nodeId, { ...state, count: output }];
  };
};

const countNode = (): Node<State, NodeId> => {
  const core = countCore<NodeId>({
    onCount: "count",
    onStop: "stop",
  });

  return async (state: State) => {
    const [nodeId, output] = await core(state.count);
    return [nodeId, { ...state, count: output }];
  };
};

const stopNode = (): Node<State, NodeId> => {
  const core = stopCore<NodeId>({ onDone: null });
  return (state: State) => {
    const [nodeId, _] = core(state.count);
    return [nodeId, state];
  };
};

const amble = ambler<State, NodeId>({
  start: startNode(),
  count: countNode(),
  stop: stopNode(),
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
