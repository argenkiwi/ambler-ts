/**
 * Represents the result of a node's execution: a transition to another node or termination.
 *
 * It is a tuple containing:
 * 1. The ID of the next node to execute (`null` to terminate the machine).
 * 2. The updated state of the machine.
 *
 * @example
 * ```ts
 * const transition: Next<State, Keys> = ["next_node", { count: 1 }];
 * const termination: Next<State, Keys> = [null, { count: 1 }];
 * ```
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Next<S, K extends string> = [key: K | null, state: S];

/**
 * A discrete processing step in the state machine.
 *
 * Receives the current state and returns a {@link Next} tuple (or a Promise resolving to one).
 * Nodes are responsible for logic, state updates, and determining the next transition.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Node<S, K extends string> = (
  state: S,
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * A factory function that constructs a {@link Node} with its dependencies.
 *
 * Factories decouple a node's internal logic (which uses semantic edge names)
 * from the external machine structure (which uses specific node IDs).
 *
 * @template E The union of internal edge names this node can traverse (e.g., "onSuccess" | "onError").
 * @template U The utilities object injected into the node (e.g., API clients, loggers).
 * @template SConstraint A constraint on the state type.
 */
export interface NodeFactory<E extends string, U, SConstraint = unknown> {
  /**
   * @template S The actual state type used in the machine (must satisfy SConstraint).
   * @template N The union of all node IDs in the machine.
   * @param edges A mapping from internal edge names (`E`) to external node IDs (`N`).
   * @param utils Optional utility dependencies for the node.
   */
  <S extends SConstraint, N extends string>(
    edges: Record<E, N | null>,
    utils?: U,
  ): Node<S, N>;
}

/**
 * Wraps a {@link Node} to operate on a different state type.
 *
 * Useful for reusing nodes that operate on a sub-state within a machine that has a larger state.
 *
 * @template S The type of the machine's state.
 * @template NS The type of the sub-state the node expects.
 * @template K The union of valid node identifier strings.
 * @param node The node to adapt.
 * @param pick A function to extract the sub-state from the machine state.
 * @param merge A function to merge the updated sub-state back into the machine state.
 * @returns A new node that operates on the machine state.
 */
export function adapt<S, NS, K extends string>(
  node: Node<NS, K>,
  pick: (state: S) => NS,
  merge: (state: S, nodeState: NS) => S,
): Node<S, K> {
  return async (state: S) => {
    const next = node(pick(state));
    const [nextNodeId, nextState] = next instanceof Promise ? await next : next;
    return [nextNodeId, merge(state, nextState)];
  };
}

/**
 * Lazily initializes a {@link Node} on its first execution.
 *
 * This is useful for breaking circular dependencies between nodes or delaying the
 * initialization of expensive resources (like network clients) until they are actually needed.
 *
 * @template S The type of the machine's state.
 * @template N The union of valid node identifier strings.
 * @param create A factory function that constructs the node.
 * @returns A node that will initialize itself using `create` when first called.
 */
export function defer<S, N extends string>(
  create: () => Node<S, N>,
): Node<S, N> {
  let node: Node<S, N> | null = null;
  return (state: S) => {
    if (!node) {
      node = create();
    }

    return node(state);
  };
}

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
export function ambler<S, K extends string>(nodes: Record<K, Node<S, K>>) {
  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    const node: Node<S, K> | undefined = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node(state);
  };
}
