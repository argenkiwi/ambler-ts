---
name: ambler-core
description: Creates a new Ambler core in the cores/ directory. Use this whenever the user wants to add a core, step, or state to an Ambler project — even if they phrase it as "add a step", "create a handler", or describe the behavior without using the word "core".
metadata:
  author: leandro
  version: "1.6"
---

# Ambler Core

Follow these steps to create a new core in the `cores/` directory.

## 1. Gather requirements

Before writing any code, determine:

- **Core name**: The purpose of the core (e.g., `retry`, `prompt`, `validate`). The file will be named `<name>.ts`.
- **State shape**: What fields does this core read or mutate? Every core has a minimum `State` interface that must include the fields it touches.
- **Edges**: What named transitions can this core take? Define an `Edge` type (union of strings) for these names.
- **Utils**: What side-effectful operations does the core perform? List them (e.g., `print`, `readLine`). Each becomes a field on the `Utils` type with a production default in `defaultUtils`.
- **Behavior**: What does the core do, and how does it choose which Edge to follow?

---

## 2. Create `cores/<name>.ts`

Use the following structure exactly. Adhere to naming conventions.

```typescript
export type Edge = "onSuccess" | "onError"; // Rename/add as appropriate

export type Utils = {
  print: (msg: string) => void;
  // readLine: (prompt: string) => string | null;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  // readLine: (msg) => prompt(msg),
};

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils = defaultUtils,
) => {
  return (input: any): [N | null, any] | Promise<[N | null, any]> => {
    // Core logic here.
    // Return [edges.onSuccess, outputData] to transition.
    return [edges.onSuccess, input];
  };
};
```

### Key rules

- **Factory Pattern**: The `factory` function must be generic over `N extends string`.
- **Named Exports**: Export `Edge` and `Utils` at the module level.
- **Utils**: `defaultUtils` contains production implementations. Complex or reusable logic (e.g., LLM calls, file I/O) should be moved to `utils/` and imported.
- **Termination**: Cores that terminate the walk still use `Record<Edge, N | null>` in their `factory` signature. In the `walks/*.ts` file, they are initialized with an edge mapped to `null` (e.g., `stop({ onDone: null })`).

---

## 3. Create `cores/tests/<name>.test.ts`

Use the `/ambler-test` skill to generate the test file.

---

## 4. Checklist before finishing

- [ ] `cores/<name>.ts` uses the `Edge` naming convention for edge keys.
- [ ] `factory` function uses `NodeFactory`.
- [ ] `State` interface is minimal.
- [ ] `defaultUtils` provides real implementations.
- [ ] No direct state mutation.
- [ ] Shared logic is in `utils/`.
- [ ] Tests exist in `cores/tests/<name>.test.ts`.
