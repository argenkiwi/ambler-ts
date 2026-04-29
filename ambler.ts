/**
 * Represents a value that can be either a synchronous value or a Promise of that value.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * The result of a node's execution.
 * Contains the identifier of the next node to execute and the updated state.
 * If 'next' is null, the state machine terminates.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Edges<H extends string, K extends string = string> = Record<
  H,
  K | null
>;

export type NodeResult<S, K extends string = string> = [key: K | null, state: S];

/**
 * A function that represents a node in the state machine.
 * Given the current state, it returns the next step in the machine.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Node<S, K extends string = string> = (
  state: S,
) => MaybePromise<NodeResult<S, K>>;

/**
 * The main execution loop factory.
 * It takes a registry of nodes and returns a function to start the state machine.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param nodes A registry of nodes, indexed by their identifiers.
 * @param options Optional configuration for the execution.
 * @returns A function that starts the state machine.
 */
export function ambler<S, K extends string>(nodes: Record<K, Node<S, K>>) {
  return (nodeId: K, state: S): MaybePromise<NodeResult<S, K>> => {
    const node: Node<S, K> | undefined = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node(state);
  };
}

/**
 * The main execution loop that drives the state machine.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param nodes A registry of nodes, indexed by their identifiers.
 * @param initialNodeId The identifier of the first node in the state machine.
 * @param initialState The initial state of the machine.
 * @param options Optional configuration for the execution.
 * @returns A promise that resolves to the final state when the state machine completes.
 */
export async function amble<S, K extends string>(
  nodes: Record<K, Node<S, K>>,
  initialNodeId: K,
  initialState: S,
  options?: {
    onNext?: (nodeId: K, state: S) => MaybePromise<void>;
  },
): Promise<S> {
  let nodeId: K | null = initialNodeId;
  let state = initialState;
  const next = ambler(nodes);
  while (nodeId) {
    if (options?.onNext) {
      await options.onNext(nodeId, state);
    }

    const result = await next(nodeId, state);
    nodeId = result[0];
    state = result[1];
  }

  return state;
}
