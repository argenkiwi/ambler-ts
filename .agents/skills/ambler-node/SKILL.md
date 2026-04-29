---
name: ambler-node
description: Creates a new Ambler node in the nodes/ directory. Use this whenever the user wants to add a node, step, or state to an Ambler project — even if they phrase it as "add a step", "create a handler", or describe the behavior without using the word "node".
metadata:
  author: leandro
  version: "1.2"
---

# Ambler Node

Follow these steps to create a new node in the `nodes/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Node name**: The purpose of the node (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>Node.ts`.
- **State shape**: What fields does this node read or mutate? Every node has a minimum `State` interface that must include the fields it touches.
- **Hook (Edges)**: What named transitions can this node take? Define a `Hook` type (union of strings) for these names.
- **Utils**: What side-effectful operations does the node perform? List them (e.g., `print`, `readLine`). Each becomes a field on the `Utils` type with a production default in `defaultUtils`.
- **Behavior**: What does the node do, and how does it choose which Hook to follow?

---

## 2. Create `nodes/<name>Node.ts`

Use the following structure exactly. Adhere to naming conventions.

```typescript
import { Edges, Next } from "../ambler.ts";
// Import any shared utils if needed:
// import { someUtil } from "../utils/some_util.ts";

export interface State {
  // Fields this node reads or writes — at minimum.
  // The generic S extends State in create() carries the rest.
  count: number; 
}

export type Hook = "onSuccess" | "onError"; // Rename/add as appropriate

export type Utils = {
  print: (msg: string) => void;
  // readLine: (prompt: string) => string | null;
  // chat: (host: string, model: string, msgs: any[]) => Promise<string>;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  // readLine: (msg) => prompt(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return (state: S): Next<S, K> | Promise<Next<S, K>> => {
    // Node logic here.
    // Use 'async' on the returned function if using await.
    
    // Always spread state when updating: { ...state, field: newValue }
    const nextState = { ...state, count: state.count + 1 };
    
    // Return [edges.onHookName, nextState] to transition.
    return [edges.onSuccess, nextState];
  };
}
```

### Key rules

- **Imports**: Always import `Edges` and `Next` from `"../ambler.ts"`.
- **Flat Exports**: Export `State`, `Hook`, `Utils`, and `create` at the module level.
- **Hook Type**: Use the name `Hook` for the union of edge name strings.
- **Edges Type**: Use `Edges<Hook, K>` in the `create` function signature.
- **State Generic**: `create<S extends State, K extends string = string>` ensures the node is compatible with any walk state that includes its minimum requirements.
- **Utils**: `defaultUtils` contains production implementations. Complex or reusable logic (e.g., LLM calls, file I/O) should be moved to `utils/` and imported.
- **Immutability**: Never mutate `state` directly; always return a new object: `{ ...state, ...updates }`.
- **Termination**: Nodes that terminate the walk still use `Edges` in their `create` signature. In the `walks/*.ts` file, they are initialized with an edge mapped to `null` (e.g., `StopNode.create({ onDone: null })`).

---

## 3. Create `nodes/<name>Node.test.ts`

Use the `/ambler-test` skill to generate the test file.

---

## 4. Checklist before finishing

- [ ] `nodes/<name>Node.ts` uses the `Hook` naming convention for edge keys.
- [ ] `create` function uses `Edges<Hook, K>` and returns `Next<S, K>`.
- [ ] `State` interface is minimal.
- [ ] `defaultUtils` provides real implementations.
- [ ] No direct state mutation.
- [ ] Shared logic is in `utils/`.
- [ ] Tests exist in `nodes/<name>Node.test.ts`.
