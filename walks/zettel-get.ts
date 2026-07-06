import { ambler } from "../ambler.ts";
import defer * as getNode from "../nodes/zettel-get.ts";

type State = getNode.State;
type NodeId = "GET";

const amble = ambler<State, NodeId>({
  GET: () => getNode.factory({ onFound: null, onNotFound: null }),
});

if (import.meta.main) {
  const id = Deno.args[0];

  if (!id) {
    console.error("Usage: deno run --allow-read walks/zettel-get.ts <id>");
    Deno.exit(1);
  }

  let nodeId: NodeId | null = "GET";
  let state: State = { id };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
