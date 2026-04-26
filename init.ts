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
let dirExists = false;
try {
  const stat = await Deno.stat(targetDir);
  if (!stat.isDirectory) {
    console.error(`Error: "${targetDir}" exists and is not a directory.`);
    Deno.exit(1);
  }
  dirExists = true;
} catch {
  // Does not exist — will be created
}

if (dirExists) {
  let isEmpty = true;
  for await (const _ of Deno.readDir(targetDir)) {
    isEmpty = false;
    break;
  }
  if (!isEmpty) {
    console.error(`Error: "${targetDir}" is not empty. Aborting.`);
    Deno.exit(1);
  }
}

// Create directory structure
const dirs = [
  targetDir,
  `${targetDir}/nodes`,
  `${targetDir}/walks`,
  `${targetDir}/specs`,
  `${targetDir}/.claude`,
  `${targetDir}/.claude/skills`,
  `${targetDir}/.claude/skills/add-node`,
  `${targetDir}/.claude/skills/add-node-test`,
  `${targetDir}/.claude/skills/add-walk`,
  `${targetDir}/.claude/skills/add-walk-spec`,
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

The pattern for adding a new walk: write a spec in \`specs/\`, implement nodes in \`nodes/\` with full dependency injection, compose them in \`walks/\`, and add tests alongside each node file.
`;

const ADD_NODE_SKILL =
  `---
name: add-node
description: Creates a new Ambler node in the nodes/ directory following the established flat-export State/Edges/Utils/create pattern. Use this when the user wants to add a new state-machine node to the project.
metadata:
  author: leandro
  version: "1.1"
---

# Add Node

Follow these steps to create a new node in the \`nodes/\` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The purpose of the node (e.g., \`retry\`, \`prompt\`, \`validate\`). The file will be named \`<name>Node.ts\`.
- **State shape**: What fields does this node read or mutate? Every node has a minimum \`State\` interface that must include the fields it touches. Other walk-level state fields flow through untouched via the \`S extends State\` generic.
- **Edges**: What named transitions can this node take? Terminal nodes have no edges and always return \`null\`. Non-terminal nodes declare an \`Edges<S extends State>\` type whose values are \`Node<S>\`.
- **Utils**: What side-effectful operations does the node perform? List them (e.g., \`print\`, \`readLine\`, \`sleep\`, \`random\`, \`fetch\`). Each becomes a field on the \`Utils\` type with a sensible production default in \`defaultUtils\`.
- **Behavior**: What does the node do, step by step, and how does it choose which edge to follow?

If any of the above is unclear, ask the user before writing code.

---

## 2. Create \`nodes/<name>Node.ts\`

Use the following structure exactly. Do not deviate from naming conventions.

\`\`\`typescript
import { next, Node } from "../ambler.ts";
// Also import MaybePromise if any util can be sync or async:
// import { next, Node, MaybePromise } from "../ambler.ts";

export interface State {
  // Fields this node reads or writes — at minimum.
  // Keep this minimal; the generic S extends State carries the rest.
}

// Omit Edges entirely for terminal nodes.
export type Edges<S extends State> = {
  onSuccess: Node<S>;  // rename/add edge names as appropriate
  // onError: Node<S>;
};

export type Utils = {
  // One field per side-effectful operation.
  // Use function signatures that match real stdlib equivalents.
  print: (msg: string) => void;
  // readLine: (prompt: string) => MaybePromise<string | null>;
  // sleep: (ms: number) => Promise<void>;
  // random: () => number;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  // readLine: (msg) => prompt(msg),
  // sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  // random: () => Math.random(),
};

// Non-terminal node (has edges):
export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Node<S> {
  return async (state: S) => {
    // Node logic here.
    // Always spread state when updating: { ...state, field: newValue }
    // Return next(edges.onEdgeName, nextState) to transition.
    // Return null to terminate (only if this is actually a terminal node).
  };
}

// Final node variant (last step in the walk — replace the above with this):
// export function create<S extends State>(
//   edges: Edges<S>,
//   utils: Utils = defaultUtils,
// ): Node<S> {
//   return async (state: S) => {
//     // Final logic.
//     return next(edges.onDone, state);
//     // In the walk, wire: finalNode.create({ onDone: () => stop() })
//   };
// }
\`\`\`

### Key rules

- **Always import from \`"../ambler.ts"\`** — import \`next\` and \`Node\`. Import \`MaybePromise\` if any util type is sync-or-async (e.g. \`readLine\`).
- **Do not import \`Next\`** — the return type of the inner function is inferred from \`Node<S>\`; no explicit annotation is needed.
- **Exports are flat at module level** — no namespace wrapper. Walks import the module with \`import * as MyNode from "../nodes/myNode.ts"\`, which gives \`MyNode.State\`, \`MyNode.create\`, etc.
- **\`State\` is a minimum interface** — only include fields this node actually uses. The generic \`S extends State\` allows the walk to pass a richer state type without breaking the type system.
- **\`Edges<S extends State>\` uses the same generic** so that edge functions accept the full walk state, not just the node's minimum state.
- **\`defaultUtils\` provides production implementations** — these are what run in the real walk. Tests always inject mock utils.
- **State is immutable** — never mutate \`state\` directly; always return \`{ ...state, field: value }\`.
- **Return \`next(edges.onEdgeName, nextState)\`** (function call) to transition. Nodes never return \`null\` directly — termination is handled in the walk by wiring the final edge to \`() => stop()\`.

---

## 3. Create \`nodes/<name>Node.test.ts\`

Use the \`/add-node-test\` skill to generate the test file for this node.

---

## 4. Checklist before finishing

- [ ] \`nodes/<name>Node.ts\` exists and compiles (no TypeScript errors).
- [ ] \`nodes/<name>Node.test.ts\` exists with one test per branch.
- [ ] All exports are flat module-level (\`export interface State\`, \`export type Edges\`, \`export function create\`) — no namespace wrapper.
- [ ] \`State\`, \`Edges\` (if non-terminal), \`Utils\`, \`defaultUtils\`, and \`create\` are all exported or defined.
- [ ] No barrel/index file was created or modified — nodes are imported individually.
- [ ] State is never mutated in place.
- [ ] All utils in \`defaultUtils\` use real production implementations (\`console.log\`, \`prompt\`, \`Math.random\`, \`setTimeout\`, etc.).

---

## 5. Reference: the three node archetypes

| Archetype | Edges | Typical use |
|---|---|---|
| Entry node | Yes (e.g. \`onSuccess\`, \`onError\`) | Prompts input, validates, branches on outcome |
| Loop/transform node | Yes (e.g. \`onContinue\`, \`onStop\`) | Performs work, conditionally loops or exits |
| Final node | Yes (e.g. \`onDone\`) | Displays final result; walk wires \`onDone: () => stop()\` to end the walk |

When unsure which archetype fits, ask the user whether the new node should loop, branch, or terminate the walk.
`;

const ADD_NODE_TEST_SKILL =
  `---
name: add-node-test
description: Creates a test file for an Ambler node in the nodes/ directory. Use this when the user wants to add or generate tests for an existing or newly created node.
metadata:
  author: leandro
  version: "1.1"
---

# Add Node Test

Follow these steps to create a test file for a node in the \`nodes/\` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The camelCase name (e.g., \`retry\`, \`prompt\`, \`validate\`) — the test file will be \`nodes/<name>Node.test.ts\`.
- **Node's State, Edges, and Utils**: Read \`nodes/<name>Node.ts\` to understand what the node does, which edges it has, and what utils it uses.
- **Branches to cover**: Every \`return next(...)\` line is one branch; the terminal \`return null\` is another. List them all before writing any test.

If any of the above is unclear, read the node file first.

---

## 2. Create \`nodes/<name>Node.test.ts\`

Write one \`Deno.test\` per meaningful branch of logic (one per edge + one per error/edge case).

\`\`\`typescript
import { assertEquals } from "@std/assert";
import * as <Name>Node from "./<name>Node.ts";
import { Node } from "../ambler.ts";

Deno.test("<name>Node should <behavior> when <condition>", async () => {
  const initialState: <Name>Node.State = { /* ... */ };
  let capturedState: <Name>Node.State | undefined;

  // Capture function to observe state after transition.
  const captureNext: Node<<Name>Node.State> = async (s) => {
    capturedState = s;
    return null;
  };
  // For edges that should NOT be taken in this test, use a no-op or a throw:
  // const captureOther: Node<<Name>Node.State> = async (_s) => null;

  const utils: <Name>Node.Utils = {
    print: () => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const nextResult = await <Name>Node.create(
    { onSuccess: captureNext /*, onError: captureOther */ },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult();  // Drives state into captureNext.

  assertEquals(capturedState?.someField, expectedValue);
});
\`\`\`

### Test rules

- **Import \`assertEquals\` from \`@std/assert\`** — same as the rest of the project.
- **Import the node with \`import * as <Name>Node\`** — matches the flat module-level export pattern; gives access to \`<Name>Node.State\`, \`<Name>Node.Utils\`, \`<Name>Node.create\`, etc.
- **Mock all \`Utils\`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every \`return next(...)\` line and the \`null\` case for terminal nodes.
- **Use closure variables to capture state** — declare \`let capturedState\` before the test, assign inside \`captureNext\`, assert after \`nextResult()\`.
- **Guard against unexpected \`null\`** — always check \`if (!nextResult) throw new Error(...)\` before calling it, unless you are testing a terminal node that must return \`null\` (in which case assert \`assertEquals(nextResult, null)\`).
- **Test names follow the pattern**: \`"<name>Node should <expected behavior> when <condition>"\`.

---

## 3. Checklist before finishing

- [ ] \`nodes/<name>Node.test.ts\` exists with one test per branch.
- [ ] All \`Utils\` are mocked — no real I/O, network, or timing.
- [ ] Every edge path (\`return next(...)\`) has a dedicated test.
- [ ] Terminal \`return null\` paths are asserted with \`assertEquals(nextResult, null)\`.
- [ ] Test names follow \`"<name>Node should <behavior> when <condition>"\`.
- [ ] Run \`deno test nodes/<name>Node.test.ts\` to verify all tests pass.
`;

const ADD_WALK_SKILL =
  `---
name: add-walk
description: Creates a new Ambler walk; the TypeScript wiring file (walks/<name>.ts) and the Markdown specification (specs/<name>.md). Ensures any required nodes exist or creates them. Use this when the user wants to add a new state-machine program to the project.
metadata:
  author: leandro
  version: "1.1"
---

# Add Walk

This skill guides you in creating a complete Ambler walk. A walk is a state-machine program consisting of two files:

1. \`walks/<name>.ts\` — TypeScript file defining the shared \`State\`, \`initialState\`, and the wired node graph.
2. \`specs/<name>.md\` — Markdown specification describing the shared state and the logic/transitions of each step.

As the project grows, refer to existing files in \`walks/\` and \`specs/\` as reference examples, or consult \`ambler.ts\` for the core primitives.

---

## Step 1 — Identify the Walk

- Determine the walk name (lowercase, hyphen-separated, e.g. \`my-walk\`). The file will be \`walks/<name>.ts\`.
- Clarify the walk's purpose: what program does it implement?
- Identify the nodes (steps) required and their transitions.

---

## Step 2 — Ensure Nodes Exist

For each node the walk requires:

- Check if a file \`nodes/<nodeName>.ts\` already exists (use Glob).
- If it does **not** exist, create it **before** writing the walk. Follow the Node Pattern below.
- Also create \`nodes/<nodeName>.test.ts\` for every new node and verify tests pass with \`deno test nodes/<nodeName>.test.ts\`.

### Node Pattern

Every node in \`nodes/\` uses flat module-level exports — no namespace wrapper. Walks import with \`import * as MyNode from "../nodes/myNode.ts"\`.

\`\`\`typescript
// nodes/myNode.ts
import { next, Node } from "../ambler.ts";

export interface State {
  // Only the properties this node uses
  field: string;
}

export type Edges<S extends State> = {
  onSuccess: Node<S>;
  onError: Node<S>;
};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Node<S> {
  return async (state: S) => {
    utils.print(\`...\`);
    return next(edges.onSuccess, state);
  };
}
\`\`\`

**Final nodes** (last step of the walk) have an \`onDone\` edge; the walk wires it to \`() => stop()\`:

\`\`\`typescript
export type Edges<S extends State> = {
  onDone: Node<S>;
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Node<S> {
  return async (state: S) => {
    utils.print(\`Done: \${state.field}\`);
    return next(edges.onDone, state);
    // Walk wires: finalNode.create({ onDone: () => stop() })
  };
}
\`\`\`

### Node Test Pattern

\`\`\`typescript
// nodes/myNode.test.ts
import { assertEquals } from "@std/assert";
import * as MyNode from "./myNode.ts";
import { Node } from "../ambler.ts";

Deno.test("myNode should transition to onSuccess", async () => {
  let captured: MyNode.State | undefined;
  const capture: Node<MyNode.State> = async (s) => { captured = s; return null; };

  const mockUtils: MyNode.Utils = {
    print: () => {},
  };

  const nextResult = await MyNode.create(
    { onSuccess: capture, onError: async () => null },
    mockUtils,
  )({ field: "test" });

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult();

  assertEquals(captured?.field, "test");
});
\`\`\`

**Rules for nodes:**
- Define a local \`State\` interface with only the properties the node needs.
- Inject all side-effects via \`Utils\` — never call \`console.log\`, \`prompt\`, \`Math.random\`, etc. directly.
- Never hardcode transitions; always use the \`edges\` parameter.
- Never use \`export default\`.
- Use \`next(edges.onEdgeName, newState)\` (function call) to transition — not \`new Next(...)\`.

---

## Step 3 — Create the Specification File (\`specs/<name>.md\`)

Create the Markdown spec **before** the TypeScript file, so it acts as a blueprint.

Follow this exact format:

\`\`\`markdown
# Program Specifications

<Brief description of the program and its purpose.>

## Shared State

<Description of the State interface properties.>

## Steps

### <Node Name 1>
- This is the initial step of the application.
- <What it does — inputs, logic.>
- <Transitions: "If X, it proceeds to \`NEXT_STEP\`." Use ALL_CAPS backtick names for step references.>

### <Node Name 2>
- <Role.>
- <Logic.>
- <Transitions.>

### <Node Name N>
- <Role — this is the terminal step.>
- <What it displays or does.>
- <Termination: "Terminates the process." / "Returns null.">
\`\`\`

**Formatting rules:**
- Section heading: \`# Program Specifications\` (no sub-title).
- Step headings: \`### Title Case\` (e.g. \`### Count\`).
- Step cross-references in prose: backtick ALL_CAPS (e.g. \`COUNT\`).
- Use bullet points (\`-\`) for all step descriptions.

---

## Step 4 — Create the Wiring File (\`walks/<name>.ts\`)

\`\`\`typescript
import { amble, node, Node, stop } from "../ambler.ts";
import * as NodeA from "../nodes/nodeA.ts";
import * as NodeB from "../nodes/nodeB.ts";
import * as NodeC from "../nodes/nodeC.ts";

export interface State {
  field: string;
}

const initialState: State = {
  field: "initial",
};

const nodes: Record<string, Node<State>> = {
  start: node(() => NodeA.create({ onSuccess: nodes.next, onError: nodes.start })),
  next:  node(() => NodeB.create({ onComplete: nodes.stop })),
  stop:  node(() => NodeC.create({ onDone: () => stop() })),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
\`\`\`

**Key rules:**
- Import \`amble\`, \`node\`, \`Node\`, \`stop\` from \`../ambler.ts\`.
- Import each node module with \`import * as <Name>Node from "../nodes/<name>Node.ts"\`.
- Define \`State\` interface and \`initialState\` at the top of the file.
- Use \`Record<string, Node<State>>\` for the \`nodes\` object.
- Always wrap node creation in \`node(() => ...)\` to handle circular/forward references.
- Include the \`if (import.meta.main)\` guard.

---

## Step 5 — Verify

Run the walk to confirm it behaves as specified:

\`\`\`
deno run --allow-all walks/<name>.ts
\`\`\`

If the walk has new nodes, also run:

\`\`\`
deno test nodes/
\`\`\`

---

## Checklist

Before finishing, confirm:

- [ ] \`specs/<name>.md\` exists and matches the node names in the \`.ts\` file.
- [ ] \`walks/<name>.ts\` exists with the correct \`State\`, \`initialState\`, and wired \`nodes\`.
- [ ] Every node used in the walk has a corresponding \`nodes/<nodeName>.ts\`.
- [ ] Every new node has a \`nodes/<nodeName>.test.ts\` with at least one test.
- [ ] All tests pass.
- [ ] The walk runs end-to-end without errors.
`;

const ADD_WALK_SPEC_SKILL =
  `---
name: add-walk-spec
description: Creates a Markdown specification file for an Ambler walk in the specs/ directory, following the Ambler spec format. Use this when a user wants to document a new or existing walk.
metadata:
  author: leandro
  version: "1.0"
---

# Add Walk Specification

This skill guides you in creating a Markdown specification file (\`specs/<walk-name>.md\`) for an Ambler walk. These specs describe the program's shared state and the logic for each step (node) in the state machine, following the established format below.

## Instructions

### 1. Identify the Walk's Name and Purpose

- If not provided, ask the user for the name and a brief description of the walk.
- The file should be named \`specs/<name>.md\`.

### 2. Determine the Shared State

- Identify the data structure passed between nodes.
- Describe it under a \`## Shared State\` heading.

### 3. Map the Steps (Nodes)

- Identify all nodes in the walk.
- For each node, create a \`### <Node Name>\` subsection under \`## Steps\`.
- Describe:
  - Its role (e.g., "This is the initial step").
  - Its logic (what it does).
  - Its transitions (what conditions lead to which next step).

### 4. Format the Markdown

Follow this exact format:

\`\`\`markdown
# Program Specifications

<Brief description of the program and its purpose.>

## Shared State

<Description of the state object shared across the nodes.>

## Steps

### <Node Name 1>
- <Role — e.g., "This is the initial step.">
- <Logic — e.g., "Prompts the user to enter X.">
- <Transitions — e.g., "If valid, proceeds to \`NEXT\`. If invalid, proceeds to \`START\`.">

### <Node Name 2>
- <Role.>
- <Logic.>
- <Transitions.>

### <Node Name N>
- <Role — e.g., final step.>
- <Logic.>
- <Termination — e.g., "Displays result and terminates.">
\`\`\`

### 5. Write the File

Use the Write tool to create \`specs/<name>.md\`.

## Guidelines

- **Node name casing**: Use Title Case for headings (\`### Count\`) and backtick-quoted ALL_CAPS for references in transition descriptions (\`COUNT\`), matching the style of existing specs.
- **Clarity**: Describe *what* the program does, not *how* the code implements it.
- **Consistency**: If \`walks/<name>.ts\` already exists, ensure the spec reflects the implementation. If it doesn't, treat the spec as a blueprint.
- **No extra sections**: Stick to \`# Program Specifications\`, \`## Shared State\`, and \`## Steps\` — no additional top-level sections unless the walk clearly requires them.
`;

// ─── Write files ─────────────────────────────────────────────────────────────

const files = [
  { path: "ambler.ts", content: AMBLER_TS },
  { path: "deno.json", content: DENO_JSON },
  { path: "CLAUDE.md", content: CLAUDE_MD },
  { path: ".claude/skills/add-node/SKILL.md", content: ADD_NODE_SKILL },
  {
    path: ".claude/skills/add-node-test/SKILL.md",
    content: ADD_NODE_TEST_SKILL,
  },
  { path: ".claude/skills/add-walk/SKILL.md", content: ADD_WALK_SKILL },
  {
    path: ".claude/skills/add-walk-spec/SKILL.md",
    content: ADD_WALK_SPEC_SKILL,
  },
];

console.log(`Initializing ambler project in "${targetDir}"...`);
for (const file of files) {
  await Deno.writeTextFile(`${targetDir}/${file.path}`, file.content);
  console.log(`  Created: ${file.path}`);
}
console.log(`\nDone! Run "deno check ${targetDir}/ambler.ts" to verify.`);
