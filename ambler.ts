/**
 * Represents the result of a node's execution: a transition to another node or termination.
 *
 * It is a tuple containing:
 * 1. The ID of the next node to execute (`null` to terminate the machine).
 * 2. The updated state of the machine.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Next<S, K extends string> = [key: K | null, state: S];

/**
 * A discrete processing step in the state machine.
 *
 * Receives the current state and returns a {@link Next} tuple (or a Promise resolving to one).
 * Nodes are responsible for logic, updating the state, and determining the next transition.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Node<S, K extends string> = (
  state: S,
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * Creates a state machine runner from a collection of nodes.
 *
 * The returned function takes a node ID and the current state, and executes the corresponding node.
 * It is typically used in a loop to drive the machine until it terminates.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param nodes A mapping of node IDs to their implementations.
 * @returns A runner function that executes a specific node.
 * @throws {Error} If the requested nodeId does not exist in the nodes record.
 */
export function ambler<S, K extends string>(
  nodes: Record<K, Node<S, K>>,
) {
  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    const node = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node(state);
  };
}
