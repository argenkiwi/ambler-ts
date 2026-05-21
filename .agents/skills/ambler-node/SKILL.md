---
name: ambler-node
description: Creates a new Ambler node in the nodes/ directory. Use this whenever the user wants to add a node, step, or state to an Ambler project — even if they phrase it as "add a step", "create a handler", or describe the behavior without using the word "node".
metadata:
  author: leandro
  version: "2.2"
---

# Ambler Node

Follow these steps to create a new node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Research Existing Nodes:** Check `specs/*.md` and `nodes/` to see if a node with similar behavior already exists. It is always better to reuse or adapt an existing node than to create a duplicate.
- **Node name**: The purpose of the node (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>.ts`.
- **State shape**: What fields does this node read or mutate? Every node has a minimum `State` interface that must include the fields it touches.
- **Edges**: What named transitions can this node take? Define an `Edge` type (union of strings) for these names.
- **Utils**: What side-effectful operations does the node perform? List them (e.g., `print`, `readLine`). Each becomes a field on the `Utils` type with a production default in `defaultUtils`.
- **Behavior**: What does the node do, and how does it choose which Edge to follow?

---

## 2. Create the skeleton `nodes/<name>.ts`

Use the following structure exactly. Adhere to naming conventions. Under TDD, this initial implementation is a **skeleton/stub** to define types and compile.

```typescript
import { SyncNodeFactory, AsyncNodeFactory } from "../ambler.ts";
// Import any shared utils if needed:
// import { someUtil } from "../utils/some_util.ts";

export interface State {
  // Fields this node reads or writes — at minimum.
  count: number; 
}

export type Edge = "onSuccess" | "onError"; // Rename/add as appropriate

export type Utils = {
  print: (msg: string) => void;
  // readLine: (prompt: string) => string | null;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  // readLine: (msg) => prompt(msg),
};

// Use SyncNodeFactory for synchronous nodes, AsyncNodeFactory for asynchronous ones.
export const factory: SyncNodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    // TDD skeleton: return a stub that transitions to initial edge without changing state.
    // Replace this implementation in Step 4 after writing tests.
    return [edges.onSuccess, state];
  };
};
```

### Key rules

- **Imports**: Always import `SyncNodeFactory` and/or `AsyncNodeFactory` from `"../ambler.ts"`.
- **Exports**: Use `export const factory` for the node factory.
- **Named Exports**: Export `State` (if specific), `Edge`, and `Utils` at the module level.
- **Factory Type**: Use `SyncNodeFactory<State, Edge, Utils>` or `AsyncNodeFactory<State, Edge, Utils>` to ensure types are correctly enforced and to signal whether the node is async.
- **Utils**: `defaultUtils` contains production implementations. Complex or reusable logic (e.g., LLM calls, file I/O) should be moved to `utils/` and imported.
- **Immutability**: Never mutate `state` directly; always return a new object: `{ ...state, ...updates }`.
- **Termination**: Nodes that terminate the walk still use `Record<Edge, K | null>` in their factory signature. In the `walks/*.ts` file, they are initialized with an edge mapped to `null` (e.g., `stopNode({ onDone: null })`).

---

## 3. Create the test file `nodes/tests/<name>.test.ts` (TDD Red Phase)

Use the `/ambler-test` skill to write a complete set of tests before implementing the node's business logic.
Run the tests using Deno:
```bash
deno test nodes/tests/<name>.test.ts
```
Ensure they fail as expected (since the node is currently just a skeleton stub).

---

## 4. Implement the Node Logic in `nodes/<name>.ts` (TDD Green Phase)

Replace the stub implementation in `nodes/<name>.ts` with the actual business logic to satisfy all of your test assertions.
Run the tests again:
```bash
deno test nodes/tests/<name>.test.ts
```
Ensure they all pass.

---

## 5. Refactor (TDD Refactor Phase)

Improve the code quality, remove duplication, and extract complex logic into the `utils/` folder using `/ambler-util` as needed. Run the tests continuously to ensure they remain green.

---

## 6. Adapter Nodes (Optional)

If you need to use an existing node but the walk's state has different property names, create an adapter node.

```typescript
import { AsyncNodeFactory } from "../ambler.ts";
import { factory as originalFactory, Edge, Utils } from "./originalNode.ts";

export interface State {
  // The walk's state property name
  newPropertyName: number;
}

/**
 * Adapter that maps 'newPropertyName' state property to 'originalPropertyName'.
 */
export const factory: AsyncNodeFactory<State, Edge, Utils> = (edges, utils) => {
  const node = originalFactory(edges, utils);

  return async (state) => {
    // 1. Map from walk state to original node state
    const [edge, nextState] = await node({ 
      originalPropertyName: state.newPropertyName 
    } as any);

    // 2. Map back from original node state to walk state
    return [edge, { ...state, newPropertyName: (nextState as any).originalPropertyName }];
  };
};
```

---

## 7. Checklist before finishing

- [ ] `nodes/<name>.ts` uses the `Edge` naming convention for edge keys.
- [ ] Factory uses `SyncNodeFactory<State, Edge, Utils>` or `AsyncNodeFactory<State, Edge, Utils>` and is exported as `factory`.
- [ ] `State` interface is minimal.
- [ ] `defaultUtils` provides real implementations.
- [ ] No direct state mutation.
- [ ] Shared logic is in `utils/`.
- [ ] Tests exist in `nodes/tests/<name>.test.ts` (developed via TDD Red-Green-Refactor).
- [ ] All tests pass when running `deno test nodes/tests/<name>.test.ts`.
