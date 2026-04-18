---
name: add-node-test
description: Creates a test file for an Ambler node in the nodes/ directory. Use this when the user wants to add or generate tests for an existing or newly created node.
metadata:
  author: leandro
  version: "1.1"
---

# Add Node Test

Follow these steps to create a test file for a node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The camelCase name (e.g., `retry`, `prompt`, `validate`) — the test file will be `nodes/<name>Node.test.ts`.
- **Node's State, Edges, and Utils**: Read `nodes/<name>Node.ts` to understand what the node does, which edges it has, and what utils it uses.
- **Branches to cover**: Every `return next(...)` line is one branch; the terminal `return null` is another. List them all before writing any test.

If any of the above is unclear, read the node file first.

---

## 2. Create `nodes/<name>Node.test.ts`

Write one `Deno.test` per meaningful branch of logic (one per edge + one per error/edge case).

```typescript
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as <Name>Node from "./<name>Node.ts";
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
- **Import the node with `import * as <Name>Node`** — matches the flat module-level export pattern; gives access to `<Name>Node.State`, `<Name>Node.Utils`, `<Name>Node.create`, etc.
- **Mock all `Utils`** — no real I/O, no real sleeps, no real randomness. Make them deterministic closures.
- **One test per edge/branch** — cover every `return next(...)` line and the `null` case for terminal nodes.
- **Use closure variables to capture state** — declare `let capturedState` before the test, assign inside `captureNext`, assert after `nextResult.run()`.
- **Guard against unexpected `null`** — always check `if (!nextResult) throw new Error(...)` before calling `.run()`, unless you are testing a terminal node that must return `null` (in which case assert `assertEquals(nextResult, null)`).
- **Test names follow the pattern**: `"<name>Node should <expected behavior> when <condition>"`.

---

## 3. Checklist before finishing

- [ ] `nodes/<name>Node.test.ts` exists with one test per branch.
- [ ] All `Utils` are mocked — no real I/O, network, or timing.
- [ ] Every edge path (`return next(...)`) has a dedicated test.
- [ ] Terminal `return null` paths are asserted with `assertEquals(nextResult, null)`.
- [ ] Test names follow `"<name>Node should <behavior> when <condition>"`.
- [ ] Run `deno test nodes/<name>Node.test.ts` to verify all tests pass.
