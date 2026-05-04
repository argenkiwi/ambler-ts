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
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * A factory function that constructs a Node from an edge map and optional utils.
 *
 * @template E The union of edge names this node can traverse.
 * @template U The utils object injected into the node at construction time.
 * @template SConstraint An optional constraint on the state type (default: unknown).
 */
export interface NodeFactory<E extends string, U, SConstraint = unknown> {
  <S extends SConstraint, N extends string>(
    edges: Record<E, N | null>,
    utils?: U,
  ): Node<S, N>;
}

/**
 * The function passed to the ambler setup callback.
 * Binds a node factory to its edge map, deferring instantiation until first execution.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Bind<S, K extends string> = <E extends string, U>(
  factory: NodeFactory<E, U, S>,
  edges: Record<E, K | null>,
  adapter?: (state: S, node: Node<S, K>) => Next<S, K> | Promise<Next<S, K>>,
  utils?: U,
) => Node<S, K>;

/**
 * Creates an adapter that maps between a walk's full state and a node's local state slice.
 *
 * @param pick - Extracts the node-local state from the full walk state.
 * @param merge - Merges the node's returned state back into the full walk state.
 * @returns An adapter compatible with the `adapter` parameter of `bind`.
 */
export function stateAdapter<S, NS, K extends string>(
  pick: (state: S) => NS,
  merge: (state: S, nodeState: NS) => S,
) {
  return async (state: S, node: Node<NS, K>): Promise<Next<S, K>> => {
    const next = node(pick(state));
    const [nextNodeId, nextState] = typeof next === "function"
      ? next
      : await next;

    return [nextNodeId, merge(state, nextState)];
  };
}

/**
 * Creates a single-step executor for a node registry.
 * The setup callback receives a `bind` function; nodes are instantiated lazily
 * on their first execution rather than upfront.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param setup A callback that registers nodes via `bind(factory, edges, utils?)`.
 * @returns A function that executes one node step and returns a Next tuple.
 */
export function ambler<S, K extends string>(
  setup: (bind: Bind<S, K>) => Record<K, Node<S, K>>,
) {
  const bind: Bind<S, K> = (
    factory,
    edges,
    adapter = (state, node) => node(state),
    utils?,
  ): Node<S, K> => {
    let node: Node<S, K> | undefined;
    return (state: S) => {
      if (!node) {
        node = factory<S, K>(edges, utils);
      }

      return adapter(state, node);
    };
  };

  const nodes = setup(bind);

  return (nodeId: K, state: S): Next<S, K> | Promise<Next<S, K>> => {
    const node: Node<S, K> | undefined = nodes[nodeId];
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    return node(state);
  };
}
