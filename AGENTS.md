# Ambler Project — Agent Guide

This file gives you everything you need to implement `state.ts`, `main.ts`,
nodes (in `nodes/`), and utilities (in `utils/`) following the ambler
state-machine architecture.

---

## 1. Overview

**Amble** is a tiny event-loop over typed state. The program is a directed
graph of *nodes*. Each node is an async function that receives the current
state and returns either a `Next` (pointing to the next node and carrying
the updated state) or `null` (to terminate). Edges are passed as callbacks
so every node can be unit-tested without mocking globals.

---

## 2. Ambler primitives (`ambler.ts` — do not modify)

```typescript
export type Nextable<S> = (state: S) => Promise<Next<S> | null>;

export class Next<S> {
    constructor(private nextFunc: Nextable<S>, private state: S) {}

    run(): Promise<Next<S> | null> {
        return this.nextFunc(this.state);
    }
}

export function node<S>(factory: () => Nextable<S>): Nextable<S> {
  return (state: S) => factory()(state);
}

export async function amble<S>(initial: Nextable<S>, state: S): Promise<void> {
    let next: Next<S> | null = await initial(state);
    while (next) {
        next = await next.run();
    }
}
```

- **`Nextable<S>`** — the type of any node: `(state: S) => Promise<Next<S> | null>`
- **`Next<S>`** — a deferred call: holds the next node function + state; call `.run()` to advance
- **`node(factory)`** — wraps a factory so that the inner `Nextable` is created lazily; required for forward references / loops
- **`amble(initial, state)`** — the event loop; drives execution until a node returns `null`

---

## 3. TODO — Define your state (`state.ts`)

Replace the placeholder fields with the actual data your application needs to
thread through all nodes.

```typescript
// state.ts
export interface State {
  // TODO: add your fields, for example:
  // inputPath: string | null;
  // results: string[];
}
```

---

## 4. TODO — Define your nodes

Fill in the table below before writing any code. Each row becomes one file in
`nodes/`.

| Node name (camelCase) | What it does | Edges (callback name → destination node) |
|-----------------------|--------------|------------------------------------------|
| exampleNode           | TODO         | onSuccess → anotherNode                  |

Rules:
- Every node name is **camelCase**; every file in `nodes/` is **camelCase** (`myNode.ts`)
- A node that ends the program returns `null` instead of a `Next`
- Keep I/O out of the node logic — inject it through `utils` so tests can override it

---

## 5. Node file convention

Every node file exports a single factory function. Copy this skeleton:

```typescript
// nodes/myNode.ts
import { Next, Nextable } from "../ambler.ts";
import { State } from "../state.ts";

type MyNodeEdges = {
  onSuccess: Nextable<State>;
  // onError: Nextable<State>;   ← add more edges as needed
};

type MyNodeUtils = {
  // inject side-effecting dependencies here, e.g.:
  // readLine: () => Promise<string>;
};

const defaultUtils: MyNodeUtils = {
  // real implementations, e.g.:
  // readLine: async () => { ... },
};

export function myNode(
  edges: MyNodeEdges,
  utils: MyNodeUtils = defaultUtils,
): Nextable<State> {
  return async (state: State): Promise<Next<State> | null> => {
    // ... do work, compute nextState ...
    const nextState: State = { ...state };

    return new Next(edges.onSuccess, nextState);
    // return null;  ← to terminate
  };
}
```

---

## 6. `main.ts` wiring convention

Declare every node as a `const` using `node(() => ...)`. Forward references
are fine because `node()` defers the factory call until the node is first
executed.

```typescript
// main.ts
import { amble, node } from "./ambler.ts";
import { State } from "./state.ts";
import { myNode } from "./nodes/myNode.ts";
import { otherNode } from "./nodes/otherNode.ts";

const initialState: State = {
  // TODO: fill in your initial state
};

// Wire the graph (order matters only for readability — forward refs work fine)
const first = node(() => myNode({ onSuccess: second }));
const second = node(() => otherNode({ onSuccess: (_state: State) => null }));

if (import.meta.main) {
  await amble(first, initialState);
}
```

---

## 7. Test file convention

One test file per node: `nodes/myNode_test.ts`.

```typescript
// nodes/myNode_test.ts
import { assertEquals } from "@std/assert";
import { myNode } from "./myNode.ts";
import { State } from "../state.ts";
import { Next, Nextable } from "../ambler.ts";

Deno.test("myNode should ...", async () => {
  const initialState: State = {
    // TODO: test state
  };

  // Capture the state passed to the next node
  let capturedState: State | undefined;
  const captureNext: Nextable<State> = async (s) => { capturedState = s; return null; };

  const nextResult = await myNode(
    { onSuccess: captureNext },
    { /* mock utils here */ },
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.someField, "expected value");
});
```

---

## 8. Deno commands

```bash
deno run --allow-read --allow-net main.ts   # run the app
deno task dev                               # run with --watch
deno test                                   # run all tests
deno test nodes/myNode_test.ts              # run a single test file
```
