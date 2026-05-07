import { ambler } from "../ambler.ts";
import { factory as startCore } from "../cores/start.ts";
import { factory as countCore } from "../cores/count.ts";
import { factory as stopCore } from "../cores/stop.ts";

export interface State {
  count: number;
}

type NodeId = "start" | "count" | "stop";

const amble = ambler<State, NodeId>({
  start: () => {
    const core = startCore({
      onSuccess: "count",
      onError: "start",
    });

    return (state) => {
      const [nodeId, output] = core();
      return [nodeId, { ...state, count: output }];
    };
  },
  count: () => {
    const core = countCore({
      onCount: "count",
      onStop: "stop",
    });

    return async (state) => {
      const [nodeId, output] = await core(state.count);
      return [nodeId, { ...state, count: output }];
    };
  },
  stop: () => {
    const core = stopCore({ onDone: null });
    return (state) => {
      const [nodeId, _] = core(state.count);
      return [nodeId, state];
    };
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
