/**
 * Represents a value that can be either a synchronous value or a Promise of that value.
 */
export type MaybePromise<T> = T | Promise<T>;

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
) => MaybePromise<Next<S, K>>;

/**
 * Creates a single-step executor for a node registry.
 * Given a nodeId and state, it looks up and invokes that node.
 * Use `amble` to run the full execution loop.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param nodes A registry of nodes, indexed by their identifiers.
 * @returns A function that executes one node step and returns a Next tuple.
 */
export function ambler<S, K extends string>(nodes: Record<K, Node<S, K>>) {
  return (nodeId: K, state: S): MaybePromise<Next<S, K>> => {
    const node: Node<S, K> | undefined = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node(state, nodeId);
  };
}

/**
 * Runs the state machine to completion, starting from the given node and state.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param nodes A registry of nodes, indexed by their identifiers.
 * @param initialNodeId The identifier of the first node to execute.
 * @param initialState The initial state of the machine.
 * @param options.onNext Optional callback invoked before each node step.
 * @returns A promise that resolves to the final state when the machine terminates.
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
  const move = ambler(nodes);
  while (nodeId) {
    if (options?.onNext) {
      await options.onNext(nodeId, state);
    }

    const next = await move(nodeId, state);
    nodeId = next[0];
    state = next[1];
  }

  return state;
}
