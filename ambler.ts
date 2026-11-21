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
 * @template O Construction-time options, so one generic node (e.g. a yes/no
 *   prompt) can be wired under several IDs with different configuration.
 */
export type NodeFactory<NS, E extends string, U = unknown, O = undefined> = <
  N extends string,
  S extends NS,
>(
  /** A map of edge names to their target node IDs in the walk. */
  edges: Record<E, NoInfer<N> | null>,
  /** Optional utilities or dependencies required by the node. */
  utils?: U,
  /** Optional configuration fixed when the walk is wired. */
  options?: O,
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

/**
 * Thrown by {@link walk} when a node throws, recording which node failed.
 *
 * Expected failures should be routed through an edge (e.g. `onError`); this is
 * for the unexpected ones.
 */
export class WalkError<K extends string = string> extends Error {
  constructor(
    readonly nodeId: K,
    cause: unknown,
  ) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`Node ${nodeId} failed: ${reason}`, { cause });
    this.name = "WalkError";
  }
}

/**
 * Runs a walk from `start` until a node returns `null` as its next ID.
 *
 * @param amble The runner returned by {@link ambler}.
 * @param start The ID of the first node to run.
 * @param state The initial state.
 * @returns The final state.
 * @throws {WalkError} If any node throws.
 */
export async function walk<S, K extends string>(
  amble: (nodeId: K, state: S) => Next<S, K> | Promise<Next<S, K>>,
  start: K,
  state: S,
): Promise<S> {
  let nodeId: K | null = start;
  while (nodeId !== null) {
    const current: K = nodeId;
    try {
      [nodeId, state] = await amble(current, state);
    } catch (cause) {
      throw new WalkError(current, cause);
    }
  }
  return state;
}
