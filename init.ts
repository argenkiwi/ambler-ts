// init.ts — Bootstrap a new Ambler project
//
// Usage:
//   deno run --allow-write --allow-read init.ts <target-dir>

const targetDir = Deno.args[0];

if (!targetDir) {
  console.error(
    "Usage: deno run --allow-write --allow-read init.ts <target-dir>",
  );
  Deno.exit(1);
}

// Validate target directory
try {
  const stat = await Deno.stat(targetDir);
  if (!stat.isDirectory) {
    console.error(`Error: "${targetDir}" exists and is not a directory.`);
    Deno.exit(1);
  }
} catch {
  // Does not exist — will be created
}

// Create directory structure
const dirs = [
  targetDir,
  `${targetDir}/nodes`,
  `${targetDir}/walks`,
  `${targetDir}/specs`,
  `${targetDir}/utils`,
];

for (const dir of dirs) {
  await Deno.mkdir(dir, { recursive: true });
}

// ─── File contents ───────────────────────────────────────────────────────────

const AMBLER_TS = `/**
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
export type Edges<Names extends string, K extends string = string> = Record<
  Names,
  K | null
>;

export type NodeResult<S, K extends string = string> = {
  next: K | null;
  state: S;
};

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
 * Helper to create a NodeResult.
 *
 * @template S The type of the machine's state.
 * @template K The union of valid node identifier strings.
 * @param next The identifier of the next node, or null to stop.
 * @param state The current state of the machine.
 * @returns A NodeResult object.
 */
export function next<S, K extends string>(
  next: K | null,
  state: S,
): NodeResult<S, K> {
  return { next, state };
}

/**
 * Helper to create a terminal NodeResult.
 *
 * @template S The type of the machine's state.
 * @param state The final state of the machine.
 * @returns A NodeResult object with next set to null.
 */
export function stop<S>(state: S): NodeResult<S, never> {
  return { next: null, state };
}

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
export function ambler<S, K extends string>(
  nodes: Record<K, Node<S, K>>,
  options?: {
    onNext?: (nodeId: K, state: S) => MaybePromise<void>;
  },
) {
  return async (initialNodeId: K, initialState: S): Promise<S> => {
    let nodeId: K | null = initialNodeId;
    let state = initialState;

    while (nodeId) {
      if (options?.onNext) {
        await options.onNext(nodeId, state);
      }

      const node: Node<S, K> | undefined = nodes[nodeId];
      if (!node) {
        throw new Error(\`Node not found: \${nodeId}\`);
      }

      const result: NodeResult<S, K> = await node(state);
      nodeId = result.next;
      state = result.state;
    }

    return state;
  };
}

/**
 * The main execution loop that drives the state machine.
 *
 * @deprecated Use ambler(nodes)(initialNodeId, initialState) instead.
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
  return ambler(nodes, options)(initialNodeId, initialState);
}
`;

const DENO_JSON = `{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.19"
  }
}
`;

// ─── Write files ─────────────────────────────────────────────────────────────

const files = [
  { path: "ambler.ts", content: AMBLER_TS },
  { path: "deno.json", content: DENO_JSON },
];

console.log(`Initializing ambler project in "${targetDir}"...`);
for (const file of files) {
  await Deno.writeTextFile(`${targetDir}/${file.path}`, file.content);
  console.log(`  Created: ${file.path}`);
}

console.log(`\nDone! Run "deno check ${targetDir}/ambler.ts" to verify.`);
