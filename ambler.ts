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
  key?: K,
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * A factory function that constructs a Node from an edge map and optional utils.
 *
 * @template E The union of edge names this node can traverse.
 * @template U The utils object injected into the node at construction time.
 * @template SConstraint An optional constraint on the state type (default: unknown).
 */
export interface NodeFactory<E extends string, U, SConstraint = unknown> {
  <S extends SConstraint, N extends string>(
    edges: Record<E, N | null>,
    utils?: U,
  ): Node<S, N>;
}

/**
 * Creates a single-step executor for a node registry.
 * Given a nodeId and state, it looks up and invokes that node.

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
