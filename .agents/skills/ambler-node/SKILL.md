---
name: ambler-node
description: Creates a new Ambler node in the nodes/ directory. Use this whenever the user wants to add a node, step, or state to an Ambler project — even if they phrase it as "add a step", "create a handler", or describe the behavior without using the word "node".
metadata:
  author: leandro
  version: "1.1"
---

# Ambler Node

Follow these steps to create a new node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The purpose of the node (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>Node.ts`.
- **State shape**: What fields does this node read or mutate? Every node has a minimum `State` interface that must include the fields it touches. Other walk-level state fields flow through untouched via the `S extends State` generic.
- **Edges**: What named transitions can this node take? Terminal nodes have no edges and return `stop(state)`. Non-terminal nodes declare an `Edges<Names, K>` type whose values are node identifier strings (`K`).
- **Utils**: What side-effectful operations does the node perform? List them (e.g., `print`, `readLine`, `sleep`, `random`, `fetch`). Each becomes a field on the `Utils` type with a sensible production default in `defaultUtils`.
- **Behavior**: What does the node do, step by step, and how does it choose which edge to follow?

If any of the above is unclear, ask the user before writing code.

---

## 2. Create `nodes/<name>Node.ts`

Use the following structure exactly. Do not deviate from naming conventions.

```typescript
import { Edges, next, Node } from "../ambler.ts";
// Also import MaybePromise if any util can be sync or async:
// import { next, Node, MaybePromise } from "../ambler.ts";

export interface State {
  // Fields this node reads or writes — at minimum.
  // Keep this minimal; the generic S extends State carries the rest.
}

// Omit Edges entirely for terminal nodes.
export type NodeEdges<K extends string> = Edges<
  "onSuccess", // rename/add edge names as appropriate
  K
>;

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
export function create<S extends State, K extends string = string>(
  edges: NodeEdges<K>,
  utils: Utils = defaultUtils,
): Node<S, K> {
  return async (state: S) => {
    // Node logic here.
    // Always spread state when updating: { ...state, field: newValue }
    // Return next(edges.onEdgeName, nextState) to transition.
  };
}

// Terminal node variant (no edges — replace the above with this):
// import { next, Node, stop } from "../ambler.ts";
// export function create<S extends State, K extends string = string>(
//   utils: Utils = defaultUtils,
// ): Node<S, K> {
//   return async (state: S) => {
//     // Terminal logic.
//     return stop(state);
//   };
// }
```

### Key rules

- **Always import from `"../ambler.ts"`** — import `next`, `Node`, and `Edges` for non-terminal nodes. Import `MaybePromise` if any util type is sync-or-async (e.g. `readLine`). Terminal nodes use `stop`.
- **Exports are flat at module level** — no namespace wrapper. Walks import the module with `import * as MyNode from "../nodes/myNode.ts"`, which gives `MyNode.State`, `MyNode.create`, etc.
- **`State` is a minimum interface** — only include fields this node actually uses. The generic `S extends State` allows the walk to pass a richer state type without breaking the type system.
- **`NodeEdges<K>` uses the `K` generic** so that edge values are valid node identifiers in the walk.
- **`defaultUtils` provides production implementations** — these are what run in the real walk. Tests always inject mock utils.
- **Extract complex `defaultUtils` implementations** — if any production util requires an npm/jsr import, has significant logic (error handling, retries, connection caching), or could be shared with another node, extract it to `utils/<name>.ts` using the `/ambler-util` skill instead of inlining it here. Simple one-liners like `(msg) => console.log(msg)` are fine to keep inline.
- **State is immutable** — never mutate `state` directly; always return `{ ...state, field: value }`.
- **Return `next(edges.onEdgeName, nextState)`** (function call) to transition; return `stop(state)` only from terminal nodes.

---

## 3. Create `nodes/<name>Node.test.ts`

Use the `/ambler-test` skill to generate the test file for this node.

---

## 4. Checklist before finishing

- [ ] `nodes/<name>Node.ts` exists and compiles (no TypeScript errors).
- [ ] `nodes/<name>Node.test.ts` exists with one test per branch.
- [ ] All exports are flat module-level (`export interface State`, `export type Edges`, `export function create`) — no namespace wrapper.
- [ ] `State`, `Edges` (if non-terminal), `Utils`, `defaultUtils`, and `create` are all exported or defined.
- [ ] No barrel/index file was created or modified — nodes are imported individually.
- [ ] State is never mutated in place.
- [ ] All utils in `defaultUtils` use real production implementations (`defaultPrint`, `defaultReadLine`, `Math.random`, `setTimeout`, etc.).
- [ ] Any `defaultUtils` implementation that requires an npm import, has significant logic, or is reusable across nodes has been moved to `utils/` via the `/ambler-util` skill.

---

## 5. Reference: the three existing node archetypes

| Archetype | Example | Has Edges | Returns null |
|---|---|---|---|
| Entry node (prompts user, validates) | `startNode.ts` | Yes (`onSuccess`, `onError`) | Never directly |
| Loop/transform node | `countNode.ts` | Yes (`onCount`, `onStop`) | Never directly |
| Terminal node | `stopNode.ts` | No | Always |

When unsure which archetype fits, ask the user whether the new node should loop, branch, or terminate the walk.
