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
