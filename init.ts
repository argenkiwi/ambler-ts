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

const AMBLER_TS =
  `/**
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

const DENO_JSON =
  `{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.19"
  }
}
`;

const CLAUDE_MD =
  `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

\`\`\`bash
# Run tests
deno test

# Run a single test file
deno test nodes/<name>Node.test.ts

# Run a walk directly
deno run walks/<name>.ts
\`\`\`

## Architecture

**Ambler** is a Deno/TypeScript state machine framework. The core execution model lives in \`ambler.ts\`:

- \`Node<S>\` — a function \`(state: S) => MaybePromise<Next<S>>\` representing a node in the graph
- \`Next<S>\` — a plain function; calling it advances the machine to the next step
- \`stop()\` — creates a terminal \`Next<S>\` that returns \`null\`; used in walk wiring as \`() => stop()\`
- \`node(factory)\` — wraps a node factory so it re-runs each time (enabling cyclic graphs without circular reference issues)
- \`amble(start, initialState)\` — drives the machine until a node returns \`null\`

**Nodes** (\`nodes/\`) implement individual steps. Each node is created via a factory that accepts typed transition callbacks (\`onSuccess\`, \`onError\`, \`onCount\`, etc.) and injectable utilities (\`print\`, \`sleep\`, \`random\`, \`readLine\`) for testability. Nodes always return \`Next\`. Termination is expressed in the walk wiring by passing \`() => stop()\` as the final edge.

**Walks** (\`walks/\`) wire nodes into concrete graphs and call \`amble()\`. The \`nodes\` record uses forward references resolved lazily via \`node()\`.

**Specs** (\`specs/\`) contain plain-language descriptions of walk behavior, used as design documents before implementation.

**Utilities** (\`utils/\`) contain reusable logic and helpers.

The pattern for adding a new walk: write a spec in \`specs/\`, implement nodes in \`nodes/\` with full dependency injection, compose them in \`walks/\`, and add tests alongside each node file.
`;

const AGENTS_MD =
  `# Ambler Agents

This project uses **Ambler**, a state-machine framework for agentic workflows.

## Project Structure

- \`nodes/\`: Atomic steps of the state machine.
- \`walks/\`: Graphs that wire nodes together into programs.
- \`specs/\`: Design documents for walks.
- \`utils/\`: Reusable logic and helpers.
- \`ambler.ts\`: Core execution engine.

## Guidelines

- **Nodes** must be testable via dependency injection of \`Utils\`.
- **Walks** should be designed in \`specs/\` before implementation.
- **State** is immutable; always return a new state object.
`;

// ─── Write files ─────────────────────────────────────────────────────────────

const files = [
  { path: "ambler.ts", content: AMBLER_TS },
  { path: "deno.json", content: DENO_JSON },
  { path: "CLAUDE.md", content: CLAUDE_MD },
  { path: "AGENTS.md", content: AGENTS_MD },
];

console.log(`Initializing ambler project in "${targetDir}"...`);
for (const file of files) {
  await Deno.writeTextFile(`${targetDir}/${file.path}`, file.content);
  console.log(`  Created: ${file.path}`);
}
console.log(`\nDone! Run "deno check ${targetDir}/ambler.ts" to verify.`);
