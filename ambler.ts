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
 */
export type NodeResult<S> = {
  next: string | null;
  state: S;
};

/**
 * A function that represents a node in the state machine.
 * Given the current state, it returns the next step in the machine.
 *
 * @template S The type of the machine's state.
 */
export type Node<S> = (state: S) => MaybePromise<NodeResult<S>>;

/**
 * Helper to create a NodeResult.
 *
 * @template S The type of the machine's state.
 * @param next The identifier of the next node, or null to stop.
 * @param state The current state of the machine.
 * @returns A NodeResult object.
 */
export function next<S>(next: string | null, state: S): NodeResult<S> {
  return { next, state };
}

/**
 * Helper to create a terminal NodeResult.
 *
 * @template S The type of the machine's state.
 * @param state The final state of the machine.
 * @returns A NodeResult object with next set to null.
 */
export function stop<S>(state: S): NodeResult<S> {
  return { next: null, state };
}

/**
 * The main execution loop that drives the state machine.
 * It starts with the initial node and continues to execute subsequent nodes until
 * a node returns a result with 'next' set to null.
 *
 * @template S The type of the machine's state.
 * @param nodes A registry of nodes, indexed by their identifiers.
 * @param initialNodeId The identifier of the first node in the state machine.
 * @param initialState The initial state of the machine.
 * @param options Optional configuration for the execution.
 * @returns A promise that resolves to the final state when the state machine completes.
 */
export async function amble<S>(
  nodes: Record<string, Node<S>>,
  initialNodeId: string,
  initialState: S,
  options?: {
    onStep?: (nodeId: string, state: S) => MaybePromise<void>;
  },
): Promise<S> {
  let nodeId: string | null = initialNodeId;
  let state = initialState;

  while (nodeId) {
    if (options?.onStep) {
      await options.onStep(nodeId, state);
    }

    const node: Node<S> | undefined = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    const result: NodeResult<S> = await node(state);
    nodeId = result.next;
    state = result.state;
  }

  return state;
}
