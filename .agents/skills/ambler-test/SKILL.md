---
name: ambler-test
description: Creates a test file for an Ambler node in the nodes/ directory. Use this whenever the user wants tests for a node — including "test this node", "add tests", "write tests for X", or any time a node is created without a corresponding test file.
metadata:
  author: leandro
  version: "1.2"
---

# Ambler Test

Follow these steps to create a test file for a node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The camelCase name (e.g., `retry`, `prompt`, `validate`) — the test file will be `nodes/<name>Node.test.ts`.
- **Node's State, Edges, and Utils**: Read `nodes/<name>Node.ts` to understand what the node does, which edges it has, and what utils it uses.
- **Branches to cover**: Every `return [edges.onEdgeName, ...]` line is one branch; terminal nodes return `[null, state]`. List them all before writing any test.

If any of the above is unclear, read the node file first.

---

## 2. Create `nodes/<name>Node.test.ts`

Write one `Deno.test` per meaningful branch of logic (one per edge + one per error/edge case).

```typescript
import { assertEquals } from "@std/assert";
import * as <Name>Node from "./<name>Node.ts";

Deno.test("<name>Node should <behavior> when <condition>", async () => {
  const initialState: <Name>Node.State = { /* ... */ };

  const utils: <Name>Node.Utils = {
    print: () => {},
    // Override each util to be deterministic and side-effect-free.
  };

  const result = await <Name>Node.create(
    { onSuccess: "next" /*, onError: "error" */ },
    utils,
  )(initialState);

  assertEquals(result[0], "next");           // next node key
  assertEquals(result[1].someField, value);  // updated state
});
```

For terminal nodes (which return `[null, state]`):

```typescript
Deno.test("<name>Node should terminate when <condition>", async () => {
  const initialState: <Name>Node.State = { /* ... */ };
  const utils: <Name>Node.Utils = { print: () => {} };

  const result = await <Name>Node.create({}, utils)(initialState);

  assertEquals(result[0], null);
  assertEquals(result[1].someField, expectedValue);
});
```

### Test rules

- **Import `assertEquals` from `@std/assert`** — same as the rest of the project.
- **Import the node with `import * as <Name>Node`** — matches the flat module-level export pattern; gives access to `<Name>Node.State`, `<Name>Node.Utils`, `<Name>Node.create`, etc.
- **Mock all `Utils`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every `[edges.onEdgeName, ...]` return and the `[null, state]` case for terminal nodes.
- **Assert `result[0]`** for the next node key (or `null`) and **`result[1]`** for the updated state.
- **Test names follow the pattern**: `"<name>Node should <expected behavior> when <condition>"`.

---

## 3. Checklist before finishing

- [ ] `nodes/<name>Node.test.ts` exists with one test per branch.
- [ ] All `Utils` are mocked — no real I/O, network, or timing.
- [ ] Every edge path (`[edges.onEdgeName, ...]`) has a dedicated test.
- [ ] Terminal `[null, state]` paths are asserted with `assertEquals(result[0], null)`.
- [ ] Test names follow `"<name>Node should <behavior> when <condition>"`.
- [ ] Run `deno test nodes/<name>Node.test.ts` to verify all tests pass.
