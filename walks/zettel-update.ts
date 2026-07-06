import { ambler } from "../ambler.ts";
import defer * as updateNode from "../nodes/zettel-update.ts";
import { readStdinJson } from "../utils/stdin.ts";

type State = updateNode.State;
type NodeId = "UPDATE";

const amble = ambler<State, NodeId>({
  UPDATE: () => updateNode.factory({ onUpdated: null, onNotFound: null }),
});

if (import.meta.main) {
  const id = Deno.args[0];

  if (!id) {
    console.error(
      "Usage: echo '{\"title\":\"...\"}' | deno run --allow-read --allow-write --allow-net walks/zettel-update.ts <id>",
    );
    Deno.exit(1);
  }

  const input = await readStdinJson<{ title?: string; body?: string; tags?: string[] }>();

  let nodeId: NodeId | null = "UPDATE";
  let state: State = { id, ...input };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
