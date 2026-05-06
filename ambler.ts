/**
 * Represents the result of a node's execution: a transition to another node or termination.
 *
 * It is a tuple containing:
 * 1. The ID of the next node to execute (`null` to terminate the machine).
 * 2. The output data produced by the node.
 *
 * @template O The type of the node's output.
 * @template K The union of valid node identifier strings.
 */
export type Next<O, K extends string> = [key: K | null, output: O];

/**
 * A discrete processing step in the state machine.
 *
 * Receives an input and returns a {@link Next} tuple (or a Promise resolving to one).
 * Nodes are responsible for logic, processing input into output, and determining the next transition.
 *
 * @template I The type of the input the node expects.
 * @template O The type of the output the node produces.
 * @template K The union of valid node identifier strings.
 */
export type Node<I, O, K extends string> = (
  input: I,
) => Next<O, K> | Promise<Next<O, K>>;

/**
 * A node that operates directly on the machine's global state.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type MachineNode<S, K extends string> = Node<S, S, K>;

/**
 * A factory function that constructs a {@link Node} with its dependencies.
 *
 * Factories decouple a node's internal logic (which uses semantic edge names)
 * from the external machine structure (which uses specific node IDs).
 *
 * @template E The union of internal edge names this node can traverse (e.g., "onSuccess" | "onError").
 * @template U The utilities object injected into the node (e.g., API clients, loggers).
 * @template I The input type this node operates on.
 * @template O The output type this node produces.
 */
export type NodeFactory<E extends string, U, I, O = I> = <
  N extends string,
>(
  edges: Record<E, N | null>,
  utils?: U,
) => Node<I, O, N>;

/**
 * Wraps a {@link Node} to operate on a different state type.
 *
 * Useful for reusing nodes that operate on specific input/output types within a machine
 * that has a larger global state.
 *
 * @template S The type of the machine's state.
 * @template I The type of the input the node expects.
 * @template O The type of the output the node produces.
 * @template K The union of valid node identifier strings.
 * @param node The node to adapt.
 * @param pick A function to extract the node input from the machine state.
 * @param merge A function to merge the node output back into the machine state.
 * @returns A new node that operates on the machine state.
 */
export function adapt<S, I, O, K extends string>(
  node: Node<I, O, K>,
  pick: (state: S) => I,
  merge: (state: S, output: O) => S,
): MachineNode<S, K> {
  return async (state: S) => {
    const next = node(pick(state));
    const [nextNodeId, output] = next instanceof Promise ? await next : next;
    return [nextNodeId, merge(state, output)];
  };
}

/**
 * Lazily initializes a {@link Node} on its first execution.
 *
 * This is useful for breaking circular dependencies between nodes or delaying the
 * initialization of expensive resources (like network clients) until they are actually needed.
 *
 * @template I The type of the input the node expects.
 * @template O The type of the output the node produces.
 * @template K The union of valid node identifier strings.
 * @param create A factory function that constructs the node.
 * @returns A node that will initialize itself using `create` when first called.
 */
export function defer<I, O, K extends string>(
  create: () => Node<I, O, K>,
): Node<I, O, K> {
  let node: Node<I, O, K> | null = null;
  return (input: I) => {
    if (!node) {
      node = create();
    }

    return node(input);
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
export function ambler<S, K extends string>(
  nodes: Record<K, MachineNode<S, K>>,
) {
  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    const node = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node(state);
  };
}
