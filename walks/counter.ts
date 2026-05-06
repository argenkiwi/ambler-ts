import { ambler } from "../ambler.ts";
import { factory as startFactory } from "../cores/start.ts";
import { factory as countFactory } from "../cores/count.ts";
import { factory as stopFactory } from "../cores/stop.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const startCore = startFactory<NodeId>({
  onSuccess: "count",
  onError: "start",
});

const countCore = countFactory<NodeId>({
  onCount: "count",
  onStop: "stop",
});

const stopCore = stopFactory<NodeId>({ onDone: null });

const amble = ambler<State, NodeId>({
  start: (state) => {
    const [nodeId, output] = startCore();
    return [nodeId, { ...state, count: output }];
  },
  count: async (state) => {
    const [nodeId, output] = await countCore(state.count);
    return [nodeId, { ...state, count: output }];
  },
  stop: (state) => {
    const [nodeId, _] = stopCore(state.count);
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
