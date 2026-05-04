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
 * A middleware or transformation layer that wraps a node's execution.
 *
 * Adapters can be used to transform state before/after node execution,
 * implement logging, or provide other cross-cutting concerns.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Adapter<S, K extends string> = (
  state: S,
  node: Node<S, K>,
) => Next<S, K> | Promise<Next<S, K>>;

/**
 * Registers and wires a node into the state machine.
 *
 * This function is passed to the `setup` callback of {@link ambler}. It defers the actual
 * instantiation of the node (via its factory) until it is first executed.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 */
export type Bind<S, K extends string> = <E extends string, U>(
  /** The factory used to create the node. */
  factory: NodeFactory<E, U, S>,
  /** Map of internal edge names to external node IDs. */
  edges: Record<E, K | null>,
  /** Optional adapter for state transformation or middleware. */
  adapter?: Adapter<S, K>,
  /** Utilities to inject into the factory. */
  utils?: U,
) => Node<S, K>;

/**
 * Creates an adapter that maps between a walk's shared state and a node's internal state slice.
 *
 * This is useful for building reusable nodes that only care about a specific part of the state.
 *
 * @example
 * ```ts
 * const adapter = stateAdapter(
 *   (walkState) => ({ path: walkState.sourcePath }),
 *   (walkState, nodeState) => ({ ...walkState, sourcePath: nodeState.path })
 * );
 *
 * bind(selectFileNode, { next: "edit" }, adapter);
 * ```
 *
 * @param pick - Extracts the node-local state from the shared state.
 * @param merge - Merges the node's updated internal state back into the shared state.
 * @returns An adapter compatible with the `adapter` parameter of `bind`.
 */
export function stateAdapter<S, NS, K extends string>(
  pick: (state: S) => NS,
  merge: (state: S, nodeState: NS) => S,
) {
  return async (state: S, node: Node<NS, K>): Promise<Next<S, K>> => {
    const next = node(pick(state));
    const [nextNodeId, nextState] = next instanceof Promise ? await next : next;
    return [nextNodeId, merge(state, nextState)];
  };
}

/**
 * Creates a state machine executor.
 *
 * The `setup` callback is used to register nodes using the provided `bind` function.
 * Nodes are instantiated lazily on their first execution.
 *
 * @example
 * ```ts
 * const run = ambler((bind) => ({
 *   start: bind(startNode, { onSuccess: "end" }),
 *   end: bind(stopNode, { onDone: null }),
 * }));
 *
 * let [next, state] = await run("start", { count: 0 });
 * ```
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param setup A callback that registers nodes and returns the node registry.
 * @returns A function that executes a single node step and returns the next transition.
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
