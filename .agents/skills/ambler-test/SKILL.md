---
name: ambler-test
description: Creates a test file for an Ambler node in the nodes/tests/ directory. Use this whenever the user wants tests for a node — including "test this node", "add tests", "write tests for X", or any time a node is created without a corresponding test file.
metadata:
  author: leandro
  version: "1.3"
---

# Ambler Test

Follow these steps to create a test file for a node in the `nodes/tests/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The camelCase name (e.g., `retry`, `prompt`, `validate`) — the test file will be `nodes/tests/<name>Node.test.ts`.
- **Node's State, Edges, and Utils**: Read `nodes/<name>Node.ts` to understand what the node does, which edges it has, and what utils it uses.
- **Branches to cover**: Every `return [edges.onEdgeName, ...]` line is one branch; terminal nodes return `[null, state]`. List them all before writing any test.

If any of the above is unclear, read the node file first.

---

## 2. Determine sync vs async

Look at the node's `create` return type:

- `return (state: S): Next<S, K> => { ... }` — **synchronous**: tests call the node directly, no `await`.
- `return async (state: S): Promise<Next<S, K>> => { ... }` — **asynchronous**: tests use `async () =>` and `await`.

---

## 3. Create `nodes/tests/<name>Node.test.ts`

Write one `Deno.test` per meaningful branch of logic (one per edge + one per error/edge case).

**Synchronous node:**

```typescript
import { assertEquals } from "@std/assert";
import <name>Node, { State, Utils } from "../<name>Node.ts";

Deno.test("<name>Node should <behavior> when <condition>", () => {
  const initialState: State = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = <name>Node(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(initialState);

  assertEquals(result[0], "next");           // next node key
  assertEquals(result[1].someField, value);  // updated state
});
```

**Asynchronous node:**

```typescript
import { assertEquals } from "@std/assert";
import <name>Node, { State, Utils } from "../<name>Node.ts";

Deno.test("<name>Node should <behavior> when <condition>", async () => {
  const initialState: State = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = await <name>Node(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(initialState);

  assertEquals(result[0], "next");           // next node key
  assertEquals(result[1].someField, value);  // updated state
});
```

For terminal nodes (which return `[null, state]`), substitute `{}` for edges and assert `result[0] === null`. Apply `async`/`await` only if the node is asynchronous.

### Test rules

- **Import `assertEquals` from `@std/assert`**.
- **Import the node with `import * as <Name>Node`** — matches the flat module-level export pattern; gives access to `<Name>Node.State`, `<Name>Node.Utils`, `<Name>Node.create`, etc.
- **Mock all `Utils`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every `[edges.onEdgeName, ...]` return and the `[null, state]` case for terminal nodes.
- **Assert `result[0]`** for the next node key (or `null`) and **`result[1]`** for the updated state.
- **Test names follow the pattern**: `"<name>Node should <expected behavior> when <condition>"`.
- **Do not use `async`/`await` for synchronous nodes** — sync nodes return `Next` directly; wrapping them in `async` masks type errors.

---

## 4. Checklist before finishing

- [ ] `nodes/tests/<name>Node.test.ts` exists with one test per branch.
- [ ] All `Utils` are mocked — no real I/O, network, or timing.
- [ ] Every edge path (`[edges.onEdgeName, ...]`) has a dedicated test.
- [ ] Terminal `[null, state]` paths are asserted with `assertEquals(result[0], null)`.
- [ ] Test names follow `"<name>Node should <behavior> when <condition>"`.
- [ ] Run `deno test nodes/tests/<name>Node.test.ts` to verify all tests pass.
tests pass.
