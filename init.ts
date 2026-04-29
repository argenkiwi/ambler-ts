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
 * A function that represents a node in the state machine.
 * Given the current state, it returns the next step (an edge) in the machine.
 *
 * @template S The type of the machine's state.
 */
export type Node<S> = (state: S) => MaybePromise<Next<S>>;

/**
 * Represents the result of a node's execution. Calling it advances to the next step.
 * A plain function type avoids the object allocation of an interface or class.
 *
 * @template S The type of the machine's state.
 */
export type Next<S> = () => MaybePromise<Next<S> | null>;

/**
 * Wraps a {@link Node} function and a state into a {@link Next} function.
 * This allows for easier creation of transitions.
 *
 * @template S The type of the machine's state.
 * @param node The function representing the next node.
 * @param state The current state of the machine.
 * @returns A {@link Next} function that, when invoked, executes the provided {@link Node}.
 */
export function next<S>(node: Node<S>, state: S): Next<S> {
  return () => node(state);
}

/**
 * A terminal edge that signals the end of the walk.
 *
 * @template S The type of the machine's state.
 * @returns A {@link Next} function that returns null, terminating the \`amble\` loop.
 */
export function stop<S>(): Next<S> {
  return () => null;
}

/**
 * Lazily instantiates a node from a factory and caches the result for reuse.
 * The factory is not called until the node is first entered during \`amble\` execution,
 * which breaks circular dependency cycles in the wiring graph. Subsequent visits
 * reuse the cached node instance, avoiding redundant allocations on every transition.
 *
 * @template S The type of the machine's state.
 * @param factory A function that returns a {@link Node} function when invoked.
 * @returns A {@link Node} function that lazily initializes and caches the underlying node.
 */
export function node<S>(factory: () => Node<S>): Node<S> {
  let cached: Node<S> | null = null;

  return (state: S) => {
    if (cached === null) {
      cached = factory();
    }

    return cached(state);
  };
}

/**
 * The main execution loop that drives the state machine.
 * It starts with the initial node and continues to execute subsequent nodes until
 * a node returns null.
 *
 * @template S The type of the machine's state.
 * @param initial The first node in the state machine.
 * @param state The initial state of the machine.
 * @returns A promise that resolves when the state machine completes.
 */
export async function amble<S>(initial: Node<S>, state: S): Promise<void> {
  let next: Next<S> | null = await initial(state);
  while (next) {
    next = await next();
  }
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
