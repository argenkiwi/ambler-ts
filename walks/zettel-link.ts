import { ambler } from "../ambler.ts";
import defer * as linkNode from "../nodes/zettel-link.ts";

type State = linkNode.State;
type NodeId = "LINK";

const amble = ambler<State, NodeId>({
  LINK: () => linkNode.factory({ onLinked: null, onError: null }),
});

if (import.meta.main) {
  const [fromId, toId, relation] = Deno.args;

  if (!fromId || !toId || !relation) {
    console.error(
      'Usage: deno run --allow-read --allow-write walks/zettel-link.ts <fromId> <toId> "<relation>"',
    );
    Deno.exit(1);
  }

  let nodeId: NodeId | null = "LINK";
  let state: State = { fromId, toId, relation };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
