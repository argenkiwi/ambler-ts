import { ambler } from "../ambler.ts";
import { factory as startNodeFactory } from "../nodes/startNode.ts";
import { factory as countNodeFactory } from "../nodes/countNode.ts";
import { factory as stopNodeFactory } from "../nodes/stopNode.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const amble = ambler<State, NodeId>({
  start: startNodeFactory({ onSuccess: "count", onError: "start" }),
  count: async(state) => {
    const run = countNodeFactory({ onCount: "count", onStop: "stop" });
    const [nodeId, count] = await run(state.count);
    return [nodeId, { ...state, count }];
  },
  stop: stopNodeFactory<State, NodeId>({ onDone: null }),
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
