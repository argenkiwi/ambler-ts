---
name: ambler-node
description: Creates a new Ambler node — with tests, using test-driven development. Use this whenever the user wants to add a node, step, or state to an Ambler project — even if they phrase it as "add a step", "create a handler", or describe the behavior without using the word "node". Also use when creating a node WITH tests or following TDD for a new node. For adding tests to an existing node that already has an implementation, use `/ambler-test` instead.
metadata:
  author: leandro
  version: "3.0"
---

# Ambler Node

Follow these steps to create a new node using test-driven development. Tests are written before the implementation.

## 1. Gather requirements

Before writing any code, determine:

- **Research Existing Nodes:** Check `specs/*.md` and `nodes/` to see if a node with similar behavior already exists. It is always better to reuse or adapt an existing node than to create a duplicate.
- **Node name**: The purpose of the node (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>.ts`.
- **State shape**: What fields does this node read or mutate? Every node has a minimum `State` interface that must include the fields it touches.
- **Edges**: What named transitions can this node take? Define an `Edge` type (union of strings) for these names.
- **Utils**: What side-effectful operations does the node perform? List them (e.g., `print`, `readLine`). Each becomes a field on the `Utils` type with a production default in `defaultUtils`.
- **Sync vs async**: Does the node need `await`? Determines whether the factory returns a plain function or an `async` function.
- **Behavior**: What does the node do, and how does it choose which Edge to follow?
- **Branches**: List every edge return the node can take (e.g., `onSuccess`, `onError`). Each becomes one test case. The types and branches decided here are the contract — if you find you need to change them during implementation, restart from this step.

---

## 2. Create a skeleton `nodes/<name>.ts`

Write only the type exports and a stub factory. The factory body must throw so that tests fail in step 4.

**Synchronous skeleton:**

```typescript
import { NodeFactory } from "../ambler.ts";

export interface State {
  // Fields from requirements
  count: number;
}

export type Edge = "onSuccess" | "onError"; // from requirements

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  _utils = defaultUtils,
) =>
  (_state) => {
    throw new Error("not implemented");
  };
```

**Asynchronous skeleton:**

```typescript
import { NodeFactory } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  readLine: (prompt: string) => Promise<string | null>;
};

const defaultUtils: Utils = {
  readLine: async (msg) => prompt(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  _utils = defaultUtils,
) =>
  async (_state) => {
    throw new Error("not implemented");
  };
```

Verify the skeleton compiles before writing tests:

```bash
deno check nodes/<name>.ts
```

---

## 3. Write `nodes/tests/<name>.test.ts`

Write one `Deno.test` per branch identified in step 1. All utils must be mocked — no real I/O, network, or timing.

**Synchronous node:**

```typescript
import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../<name>.ts";

Deno.test("<name>Node should <behavior> when <condition>", () => {
  const initialState: State = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
  };

  const result = factory(
    { onSuccess: "next", onError: "error" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].someField, expectedValue);
});
```

**Asynchronous node:**

```typescript
import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../<name>.ts";

Deno.test("<name>Node should <behavior> when <condition>", async () => {
  const initialState: State = { /* ... */ };

  const utils: Utils = {
    readLine: async (_prompt) => "mock input",
  };

  const result = await factory(
    { onSuccess: "next", onError: "error" },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].someField, expectedValue);
});
```

### Test rules

- **One test per branch** — one for each edge the node can return.
- **Mock all `Utils`** — deterministic closures, no side effects.
- **Assert `result[0]`** for the next node key and **`result[1]`** for the updated state.
- **Test names**: `"<name>Node should <expected behavior> when <condition>"`.
- **Do not use `async`/`await` for synchronous nodes** — maskes type errors.

---

## 4. Run tests — expect failure

```bash
deno test nodes/tests/<name>.test.ts
```

Tests must fail with `Error: not implemented` (or assertion errors). This confirms the tests are actually exercising the code path.

- If tests fail with `Error: not implemented` → correct, proceed to step 5.
- If tests fail due to a **compile error** → the skeleton types don't match the test — fix the skeleton types, not the tests.
- If tests **pass** → the skeleton was too complete; ensure the factory throws.

---

## 5. Implement `nodes/<name>.ts`

Replace the stub body with the real logic. The type exports (`State`, `Edge`, `Utils`, `defaultUtils`) stay exactly as written in step 2.

```typescript
import { NodeFactory } from "../ambler.ts";

export interface State {
  count: number;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    // Use 'async' on the returned function if using await.
    // Always spread state when updating: { ...state, field: newValue }
    const nextState = { ...state, count: state.count + 1 };
    return [edges.onSuccess, nextState];
  };
};
```

### Key rules

- **Immutability**: Never mutate `state` directly; always return `{ ...state, ...updates }`.
- **Utils**: All side effects go through `utils.*`. Complex or reusable logic (e.g., LLM calls, file I/O) should be moved to `utils/` via `/ambler-util`.
- **Termination**: Terminal nodes are wired with `null` in the walk (e.g., `stopNode({ onDone: null })`).
- **Do not modify the tests** between steps 4 and 6 — the tests define the contract; the implementation must satisfy them.

---

## 5a. Adapter Nodes (Optional)

If you need to use an existing node but the walk's state has different property names, create an adapter node. Adapters wrap a real factory, so there is no stub phase — write the adapter implementation and tests together, then verify green in step 6.

```typescript
import { NodeFactory } from "../ambler.ts";
import { factory as originalFactory, Edge, Utils } from "./originalNode.ts";

export interface State {
  newPropertyName: number;
}

export const factory: NodeFactory<State, Edge, Utils> = (edges, utils) => {
  const node = originalFactory(edges, utils);

  return async (state) => {
    const [edge, nextState] = await node({
      originalPropertyName: state.newPropertyName,
    } as any);

    return [edge, { ...state, newPropertyName: (nextState as any).originalPropertyName }];
  };
};
```

---

## 6. Run tests — must pass

```bash
deno test nodes/tests/<name>.test.ts
```

All tests must be green. Fix the implementation (never the tests) until they pass.

---

## 7. Checklist before finishing

- [ ] `nodes/<name>.ts` uses the `Edge` naming convention for edge keys.
- [ ] Factory uses `NodeFactory<State, Edge, Utils>` and is exported as `factory`.
- [ ] `State` interface is minimal.
- [ ] `defaultUtils` provides real implementations.
- [ ] No direct state mutation.
- [ ] Shared logic is in `utils/`.
- [ ] `nodes/tests/<name>.test.ts` has one test per branch.
- [ ] All `Utils` in tests are mocked.
- [ ] Tests were written (step 3) before the full implementation (step 5).
- [ ] Tests failed on step 4 before passing on step 6.
- [ ] No tests were modified between steps 4 and 6.
