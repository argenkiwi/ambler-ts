---
name: add-node
description: Creates a new Ambler node in the nodes/ directory following the established namespace/State/Edges/Utils/create pattern. Use this when the user wants to add a new state-machine node to the project.
metadata:
  author: leandro
  version: "1.0"
---

# Add Node

Follow these steps to create a new node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The purpose of the node (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>Node.ts` and the namespace `<Name>Node` (PascalCase).
- **State shape**: What fields does this node read or mutate? Every node has a minimum `State` interface that must include the fields it touches. Other walk-level state fields flow through untouched via the `S extends State` generic.
- **Edges**: What named transitions can this node take? Terminal nodes have no edges and always return `null`. Non-terminal nodes declare an `Edges<S extends State>` type whose values are `Nextable<S>`.
- **Utils**: What side-effectful operations does the node perform? List them (e.g., `print`, `readLine`, `sleep`, `random`, `fetch`). Each becomes a field on the `Utils` type with a sensible production default in `defaultUtils`.
- **Behavior**: What does the node do, step by step, and how does it choose which edge to follow?

If any of the above is unclear, ask the user before writing code.

---

## 2. Create `nodes/<name>Node.ts`

Use the following structure exactly. Do not deviate from naming conventions.

```typescript
import { Next, Nextable } from "../ambler.ts";

export namespace <Name>Node {
  export interface State {
    // Fields this node reads or writes — at minimum.
    // Keep this minimal; the generic S extends State carries the rest.
  }

  // Omit Edges entirely for terminal nodes.
  export type Edges<S extends State> = {
    onSuccess: Nextable<S>;  // rename/add edge names as appropriate
    // onError: Nextable<S>;
  };

  export type Utils = {
    // One field per side-effectful operation.
    // Use function signatures that match real stdlib equivalents.
    print: (msg: string) => void;
    // readLine: (prompt: string) => Promise<string | null>;
    // sleep: (ms: number) => Promise<void>;
    // random: () => number;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
    // readLine: async (msg: string) => prompt(msg),
    // sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    // random: () => Math.random(),
  };

  // Non-terminal node (has edges):
  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      // Node logic here.
      // Always spread state when updating: { ...state, field: newValue }
      // Return new Next(edges.onEdgeName, nextState) to transition.
      // Return null to terminate (only if this is actually a terminal node).
    };
  }

  // Terminal node variant (no edges — replace the above with this):
  // export function create<S extends State>(
  //   utils: Utils = defaultUtils,
  // ): Nextable<S> {
  //   return async (state: S): Promise<null> => {
  //     // Terminal logic.
  //     return null;
  //   };
  // }
}
```

### Key rules

- **Always import from `"../ambler.ts"`** — import `Next` for non-terminal nodes, `Nextable` always.
- **The namespace name must be `<Name>Node`** matching `PascalCase` of the file's camelCase prefix.
- **`State` is a minimum interface** — only include fields this node actually uses. The generic `S extends State` allows the walk to pass a richer state type without breaking the type system.
- **`Edges<S extends State>` uses the same generic** so that edge functions accept the full walk state, not just the node's minimum state.
- **`defaultUtils` provides production implementations** — these are what run in the real walk. Tests always inject mock utils.
- **State is immutable** — never mutate `state` directly; always return `{ ...state, field: value }`.
- **Return `new Next(edge, nextState)`** to transition; return `null` only from terminal nodes.

---

## 3. Create `nodes/<name>Node.test.ts`

Write one `Deno.test` per meaningful branch of logic (one per edge + one per error/edge case).

```typescript
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { <Name>Node } from "./<name>Node.ts";
import { Nextable } from "../ambler.ts";

Deno.test("<name>Node should <behavior> when <condition>", async () => {
  const initialState: <Name>Node.State = { /* ... */ };
  let capturedState: <Name>Node.State | undefined;

  // Capture function to observe state after transition.
  const captureNext: Nextable<<Name>Node.State> = async (s) => {
    capturedState = s;
    return null;
  };
  // For edges that should NOT be taken in this test, use a no-op or a throw:
  // const captureOther: Nextable<<Name>Node.State> = async (_s) => null;

  const utils: <Name>Node.Utils = {
    print: () => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const nextResult = await <Name>Node.create(
    { onSuccess: captureNext /*, onError: captureOther */ },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();  // Drives state into captureNext.

  assertEquals(capturedState?.someField, expectedValue);
});
```

### Test rules

- **Import `assertEquals` from `https://deno.land/std@0.224.0/assert/mod.ts`** — same version as the rest of the project.
- **Mock all `Utils`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every `return new Next(...)` line and the `null` case for terminal nodes.
- **Use closure variables to capture state** — declare `let capturedState` before the test, assign inside `captureNext`, assert after `nextResult.run()`.
- **Guard against unexpected `null`** — always check `if (!nextResult) throw new Error(...)` before calling `.run()`, unless you are testing a terminal node that must return `null` (in which case assert `assertEquals(nextResult, null)`).
- **Test names follow the pattern**: `"<name>Node should <expected behavior> when <condition>"`.

---

## 4. Checklist before finishing

- [ ] `nodes/<name>Node.ts` exists and compiles (no TypeScript errors).
- [ ] `nodes/<name>Node.test.ts` exists with one test per branch.
- [ ] The namespace is exported correctly (`export namespace <Name>Node`).
- [ ] `State`, `Edges` (if non-terminal), `Utils`, `defaultUtils`, and `create` are all exported or defined.
- [ ] No barrel/index file was created or modified — nodes are imported individually.
- [ ] State is never mutated in place.
- [ ] All utils in `defaultUtils` use real production implementations (`console.log`, `prompt`, `Math.random`, `setTimeout`, etc.).

---

## 5. Reference: the three existing node archetypes

| Archetype | Example | Has Edges | Returns null |
|---|---|---|---|
| Entry node (prompts user, validates) | `startNode.ts` | Yes (`onSuccess`, `onError`) | Never directly |
| Loop/transform node | `countNode.ts` | Yes (`onCount`, `onStop`) | Never directly |
| Terminal node | `stopNode.ts` | No | Always |

When unsure which archetype fits, ask the user whether the new node should loop, branch, or terminate the walk.
