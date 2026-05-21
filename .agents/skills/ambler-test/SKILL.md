---
name: ambler-test
description: Creates a test file for an Ambler node in the nodes/ directory. Use this whenever the user wants tests for a node — including "test this node", "add tests", "write tests for X", or any time a node is created without a corresponding test file.
metadata:
  author: leandro
  version: "2.2"
---

# Ambler Test

## 1. Gather requirements (TDD-style)

Before writing the test code, determine the expected behavior of the node based on the program specification (`specs/<walk-name>.md`) and inspect the node skeleton in `nodes/<name>.ts`:

- **Node name**: The camelCase name (e.g., `retry`, `prompt`, `validate`) — the test file will be `nodes/tests/<name>.test.ts`.
- **Node's State, Edges, and Utils**: Inspect the exported `State`, `Edge`, and `Utils` types in the skeleton `nodes/<name>.ts` to know what properties exist and what utilities must be mocked.
- **Branches to cover**: Read the specification to list the expected outcomes (e.g., success path, validation failure path, errors, edge cases). Plan to write a dedicated test case for every edge and conditional outcome before writing the implementation logic.

If any of the above is unclear, clarify the requirements or update the spec file first.

---

## 2. Determine sync vs async

Look at the node's `factory` type and its return:

- `export const factory: SyncNodeFactory<...>` or `return (state: S): Next<S, K> => { ... }` — **synchronous**: tests call the node directly, no `await`.
- `export const factory: AsyncNodeFactory<...>` or `return async (state: S): Promise<Next<S, K>> => { ... }` — **asynchronous**: tests **MUST** use `async () =>` and **MUST** `await` the node call.

---

## 3. Create `nodes/tests/<name>.test.ts`

Write one `Deno.test` per meaningful branch of logic (one per edge + one per error/edge case).

**Synchronous node:**

```typescript
import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../<name>.ts";

Deno.test("<name>Node should <behavior> when <condition>", () => {
  const initialState: State = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = factory(
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
import { factory, State, Utils } from "../<name>.ts";

Deno.test("<name>Node should <behavior> when <condition>", async () => {
  const initialState: State = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = await factory(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(initialState);

  assertEquals(result[0], "next");           // next node key
  assertEquals(result[1].someField, value);  // updated state
});
```

### Test rules

- **Import `assertEquals` from `@std/assert`** — same as the rest of the project.
- **Import with named imports**: `import { factory, State, Utils } from "../<name>.ts"`.
- **Mock all `Utils`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every `[edges.onEdgeName, ...]` return.
- **Assert `result[0]`** for the next node key and **`result[1]`** for the updated state.
- **Test names follow the pattern**: `"<name>Node should <expected behavior> when <condition>"`.
- **Do not use `async`/`await` for synchronous nodes** — sync nodes return `Next` directly; wrapping them in `async` masks type errors.

---

## 4. Checklist before finishing

- [ ] `nodes/tests/<name>.test.ts` exists with one test per branch.
- [ ] All `Utils` are mocked — no real I/O, network, or timing.
- [ ] Every edge path (`[edges.onEdgeName, ...]`) has a dedicated test.
- [ ] Test names follow `"<name>Node should <behavior> when <condition>"`.
- [ ] Verified that the tests fail when run against the skeleton/unimplemented node (Red phase).
- [ ] Verified that all tests pass when run against the implemented node (Green phase).
