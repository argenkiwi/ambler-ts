import { ambler } from "../ambler.ts";
import defer * as deleteNode from "../nodes/zettel-delete.ts";

type State = deleteNode.State;
type NodeId = "DELETE";

const amble = ambler<State, NodeId>({
  DELETE: () => deleteNode.factory({ onDeleted: null, onNotFound: null }),
});

if (import.meta.main) {
  const id = Deno.args[0];

  if (!id) {
    console.error("Usage: deno run --allow-read --allow-write walks/zettel-delete.ts <id>");
    Deno.exit(1);
  }

  let nodeId: NodeId | null = "DELETE";
  let state: State = { id };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
