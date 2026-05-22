---
name: ambler-test
description: Adds or updates tests for an existing Ambler node that already has an implementation. Use this when a node exists in nodes/<name>.ts but has no test file, when tests need extending after new branches were added, or when retrofitting TDD onto existing code. For creating a brand-new node with tests, use `/ambler-node` instead.
metadata:
  author: leandro
  version: "3.0"
---

# Ambler Test

Follow these steps to add or update tests for an existing node in `nodes/`.

> For brand-new nodes, use `/ambler-node` — it creates both the implementation and tests via a TDD cycle. This skill is for retrofitting tests onto nodes that already exist.

---

## 1. Read the existing node

Read `nodes/<name>.ts` in full. Identify:

- **State**, **Edge**, and **Utils** types.
- **Sync vs async**: Does the factory return `(state) => ...` or `async (state) => ...`?
- **All branches**: Every `return [edges.onEdgeName, ...]` line is one branch. List them all — each becomes a test.

---

## 2. Check for existing tests

Check whether `nodes/tests/<name>.test.ts` exists.

- If it **does not exist**: write a complete new test file covering every branch.
- If it **does exist**: read it, identify which branches already have coverage, and list the gaps. Only add tests for uncovered branches — do not overwrite passing tests unless the node's interface changed.

---

## 3. Write or update `nodes/tests/<name>.test.ts`

Write one `Deno.test` per uncovered branch. All utils must be mocked.

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
    // Override each util to be deterministic and side-effect-free.
  };

  const result = await factory(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].someField, expectedValue);
});
```

### Test rules

- **One test per branch** — cover every `[edges.onEdgeName, ...]` return.
- **Mock all `Utils`** — no real I/O, network, or timing.
- **Assert `result[0]`** for the next node key and **`result[1]`** for the updated state.
- **Test names**: `"<name>Node should <expected behavior> when <condition>"`.
- **Do not use `async`/`await` for synchronous nodes** — masks type errors.

---

## 4. Run tests — must pass

```bash
deno test nodes/tests/<name>.test.ts
```

All tests must pass. If any fail, fix the implementation (not the tests).

---

## 5. Checklist before finishing

- [ ] `nodes/tests/<name>.test.ts` has one test per branch.
- [ ] All `Utils` are mocked — no real I/O, network, or timing.
- [ ] Every edge path has a dedicated test.
- [ ] Test names follow `"<name>Node should <behavior> when <condition>"`.
- [ ] All tests pass.
