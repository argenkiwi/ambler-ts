import { ambler } from "../ambler.ts";
import defer * as searchNode from "../nodes/zettel-search.ts";

type State = searchNode.State;
type NodeId = "SEARCH";

const amble = ambler<State, NodeId>({
  SEARCH: () => searchNode.factory({ onFound: null, onEmpty: null }),
});

if (import.meta.main) {
  const query = Deno.args[0];
  const limit = Deno.args[1] ? Number(Deno.args[1]) : undefined;

  if (!query) {
    console.error('Usage: deno run --allow-read --allow-net walks/zettel-search.ts "<query>" [limit]');
    Deno.exit(1);
  }

  let nodeId: NodeId | null = "SEARCH";
  let state: State = { query, limit };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
