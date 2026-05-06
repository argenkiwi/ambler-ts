---
name: ambler-test
description: Creates a test file for an Ambler core in the cores/tests/ directory. Use this whenever the user wants tests for a core — including "test this core", "add tests", "write tests for X", or any time a core is created without a corresponding test file.
metadata:
  author: leandro
  version: "1.4"
---

# Ambler Test

Follow these steps to create a test file for a core in the `cores/tests/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Core name**: The camelCase name (e.g., `retry`, `prompt`, `validate`) — the test file will be `cores/tests/<name>.test.ts`.
- **Core's State, Edges, and Utils**: Read `cores/<name>.ts` to understand what the core does, which edges it has, and what utils it uses.
- **Branches to cover**: Every `return [edges.onEdgeName, ...]` line is one branch; terminal cores return `[null, state]`. List them all before writing any test.

If any of the above is unclear, read the core file first.

---
## 2. Determine sync vs async

Look at the core's `factory` return type:

- `return (input: I): Next<S, K> => { ... }` — **synchronous**: tests call the core directly, no `await`.
- `return async (input: I): Promise<Next<S, K>> => { ... }` — **asynchronous**: tests use `async () =>` and `await`.

---

## 3. Create `cores/tests/<name>.test.ts`

Write one `Deno.test` per meaningful branch of logic (one per edge + one per error/edge case).

**Synchronous core:**

```typescript
import { assertEquals } from "@std/assert";
import { factory, Utils } from "../<name>.ts";

Deno.test("<name> should <behavior> when <condition>", () => {
  const input = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = factory(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(input);

  assertEquals(result[0], "next");           // next core key
  assertEquals(result[1], value);            // output data
});
```

**Asynchronous core:**

```typescript
import { assertEquals } from "@std/assert";
import { factory, Utils } from "../<name>.ts";

Deno.test("<name> should <behavior> when <condition>", async () => {
  const input = { /* ... */ };

  const utils: Utils = {
    print: (_msg: string) => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = await factory(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(input);

  assertEquals(result[0], "next");           // next core key
  assertEquals(result[1], value);            // output data
});
```


For terminal cores (which return `[null, state]`), substitute `{}` for edges and assert `result[0] === null`. Apply `async`/`await` only if the core is asynchronous.

### Test rules

- **Import `assertEquals` from `@std/assert`**.
- **Import the core with `import { factory, Utils } from "../<name>.ts"`** — matches the flat module-level export pattern; gives access to `Utils`, and `factory`.
- **Mock all `Utils`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every `[edges.onEdgeName, ...]` return and the `[null, state]` case for terminal cores.
- **Assert `result[0]`** for the next core key (or `null`) and **`result[1]`** for the updated state.
- **Test names follow the pattern**: `"<name> should <expected behavior> when <condition>"`.
- **Do not use `async`/`await` for synchronous cores** — sync cores return `Next` directly; wrapping them in `async` masks type errors.

---

## 4. Checklist before finishing

- [ ] `cores/tests/<name>.test.ts` exists with one test per branch.
- [ ] All `Utils` are mocked — no real I/O, network, or timing.
- [ ] Every edge path (`[edges.onEdgeName, ...]`) has a dedicated test.
- [ ] Terminal `[null, state]` paths are asserted with `assertEquals(result[0], null)`.
- [ ] Test names follow `"<name> should <behavior> when <condition>"`.
- [ ] Run `deno test cores/tests/<name>.test.ts` to verify all tests pass.
tests pass.
