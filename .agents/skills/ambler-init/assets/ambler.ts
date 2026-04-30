/**
 * A map from edge names to the next node identifier (or null to terminate).
 * Used to wire node transitions in a type-safe way.
 *
 * @template H The union of edge name strings (e.g. `"onSuccess" | "onError"`).
 * @template K The union of valid node identifier strings.
 */
export type Edges<H extends string, K extends string = string> = Record<
  H,
  K | null
>;

/**
 * The result returned by a node: a tuple of [nextNodeId, newState].
 * If nextNodeId is null, the state machine terminates.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Next<S, K extends string> = [key: K | null, state: S];

/**
 * A function that represents a node in the state machine.
 * Receives the current state and the node's own key, and returns a Next tuple.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Node<S, K extends string> = (
  state: S,
  key: K,
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * Creates a single-step executor for a node registry.
 * Given a nodeId and state, it looks up and invokes that node.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param nodes A registry of nodes, indexed by their identifiers.
 * @returns A function that executes one node step and returns a Next tuple.
 */
export function ambler<S, K extends string>(nodes: Record<K, Node<S, K>>) {
  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    const node: Node<S, K> | undefined = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node(state, nodeId);
  };
}
