/**
 * The outcome of a node execution: the ID of the next node to visit (or `null` to stop) 
 * and the updated state.
 *
 * @template S The state shape of the machine.
 * @template K The union of possible node identifiers.
 */
export type Next<S, K extends string> = [key: K | null, state: S];

/** Internal representation of a node after initialization. */
type Node<S, K extends string> = 
  | ((state: S) => Next<S, K>) 
  | ((state: S) => Promise<Next<S, K>>);

/**
 * A factory for creating synchronous nodes.
 *
 * @template NS The minimum state requirements for this node.
 * @template E The names of the outgoing edges from this node.
 * @template U The shape of the utilities object provided to the node.
 */
export type SyncNodeFactory<NS, E extends string, U = unknown> = <
  N extends string,
  S extends NS,
>(
  edges: Record<E, NoInfer<N> | null>,
  utils?: U,
) => (state: S) => Next<S, N>;

/**
 * A factory for creating asynchronous nodes.
 *
 * @template NS The minimum state requirements for this node.
 * @template E The names of the outgoing edges from this node.
 * @template U The shape of the utilities object provided to the node.
 */
export type AsyncNodeFactory<NS, E extends string, U = unknown> = <
  N extends string,
  S extends NS,
>(
  edges: Record<E, NoInfer<N> | null>,
  utils?: U,
) => (state: S) => Promise<Next<S, N>>;


/**
 * Initializes an Ambler state machine runner.
 *
 * Factories are invoked lazily on their first visit and cached for the duration of the runner.
 *
 * @template S The state shape of the machine.
 * @template K The union of possible node identifiers.
 * @param nodes A map of node identifiers to their corresponding initialized nodes.
 * @returns A runner function that executes a specific node against the current state.
 * @throws {Error} If the requested node ID is not defined in the map.
 */
export function ambler<S, K extends string>(
  nodes: Record<K, () => Node<S, K>>,
) {
  const loaded: Partial<Record<K, Node<S, K>>> = {};
  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    if (!(nodeId in nodes)) {
      throw new Error(`Ambler: Node "${nodeId}" not found in graph.`);
    }
    loaded[nodeId] ??= nodes[nodeId]();
    return loaded[nodeId]!(state);
  };
}
