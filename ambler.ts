/**
 * The result of a node's execution: the next node ID (or `null` to stop) and the updated state.
 *
 * @template S The machine's state type.
 * @template K The union of valid node identifier strings.
 */
export type Next<S, K extends string> = [key: K | null, state: S];

/**
 * A processing step in the state machine.
 *
 * Receives the current state and returns a {@link Next} tuple (or a Promise resolving to one).
 *
 * @template S The machine's state type.
 * @template K The union of valid node identifier strings.
 */
export type Node<S, K extends string> = (
  state: S,
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * A factory function that creates a {@link Node}.
 *
 * It decouples the node's internal logic from the specific node IDs (edges) and
 * external dependencies (utils) used in a specific walk.
 *
 * @template NS The base state type required by this node.
 * @template E The union of valid edge names for this node.
 * @template U The type of the utilities object provided to the node.
 */
export type NodeFactory<NS, E extends string, U = unknown> = <
  N extends string,
  S extends NS,
>(
  /** A map of edge names to their target node IDs in the walk. */
  edges: Record<E, NoInfer<N> | null>,
  /** Optional utilities or dependencies required by the node. */
  utils?: U,
) => Node<S, N>;

/**
 * Creates a state machine runner from a map of node factories.
 *
 * Each factory is called once on first use; the resulting node is cached for subsequent calls.
 *
 * @template S The machine's state type.
 * @template K The union of valid node identifier strings.
 * @param nodes A map of node IDs to factory functions that produce {@link Node}s.
 * @returns A runner `(nodeId, state) => Next`.
 * @throws {Error} If `nodeId` is not present in `nodes`.
 */
export function ambler<S, K extends string>(
  nodes: Record<K, () => Node<S, K>>,
) {
  const loaded: Partial<Record<K, Node<S, K>>> = {};
  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    if (!(nodeId in nodes)) throw new Error(`Node not found: ${nodeId}`);
    loaded[nodeId] ??= nodes[nodeId]();
    return loaded[nodeId]!(state);
  };
}
