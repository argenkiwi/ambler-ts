---
name: ambler-node
description: Creates a new Ambler node in the nodes/ directory. Use this whenever the user wants to add a node, step, or state to an Ambler project — even if they phrase it as "add a step", "create a handler", or describe the behavior without using the word "node".
metadata:
  author: leandro
  version: "2.0"
---

# Ambler Node

Follow these steps to create a new node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The purpose of the node (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>.ts`.
- **State shape**: What fields does this node read or mutate? Every node has a minimum `State` interface that must include the fields it touches.
- **Edges**: What named transitions can this node take? Define an `Edge` type (union of strings) for these names.
- **Utils**: What side-effectful operations does the node perform? List them (e.g., `print`, `readLine`). Each becomes a field on the `Utils` type with a production default in `defaultUtils`.
- **Behavior**: What does the node do, and how does it choose which Edge to follow?

---

## 2. Create `nodes/<name>.ts`

Use the following structure exactly. Adhere to naming conventions.

```typescript
import { NodeFactory } from "../ambler.ts";
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

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    // Node logic here.
    // Use 'async' on the returned function if using await.
    
    // Always spread state when updating: { ...state, field: newValue }
    const nextState = { ...state, count: state.count + 1 };
    
    // Return [edges.onSuccess, nextState] to transition.
    return [edges.onSuccess, nextState];
  };
};
```

### Key rules

- **Imports**: Always import `NodeFactory` from `"../ambler.ts"`.
- **Exports**: Use `export const factory` for the node factory.
- **Named Exports**: Export `State` (if specific), `Edge`, and `Utils` at the module level.
- **NodeFactory Type**: Use `NodeFactory<State, Edge, Utils>` to ensure types are correctly enforced.
- **Utils**: `defaultUtils` contains production implementations. Complex or reusable logic (e.g., LLM calls, file I/O) should be moved to `utils/` and imported.
- **Immutability**: Never mutate `state` directly; always return a new object: `{ ...state, ...updates }`.
- **Termination**: Nodes that terminate the walk still use `Record<Edge, K | null>` in their `create` signature via `NodeFactory`. In the `walks/*.ts` file, they are initialized with an edge mapped to `null` (e.g., `stopNode({ onDone: null })`).

---

## 3. Adapter Nodes (Optional)

If you need to use an existing node but the walk's state has different property names, create an adapter node.

```typescript
import { NodeFactory } from "../ambler.ts";
import { factory as originalFactory, Edge, Utils } from "./originalNode.ts";

export interface State {
  // The walk's state property name
  newPropertyName: number;
}

/**
 * Adapter that maps 'newPropertyName' state property to 'originalPropertyName'.
 */
export const factory: NodeFactory<State, Edge, Utils> = (edges, utils) => {
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

## 4. Create `nodes/tests/<name>Node.test.ts`

Use the `/ambler-test` skill to generate the test file.

---

## 4. Checklist before finishing

- [ ] `nodes/<name>.ts` uses the `Edge` naming convention for edge keys.
- [ ] Factory uses `NodeFactory<State, Edge, Utils>` and is exported as `factory`.
- [ ] `State` interface is minimal.
- [ ] `defaultUtils` provides real implementations.
- [ ] No direct state mutation.
- [ ] Shared logic is in `utils/`.
- [ ] Tests exist in `nodes/tests/<name>Node.test.ts`.
