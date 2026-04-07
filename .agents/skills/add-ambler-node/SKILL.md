---
name: add-ambler-node
description: Specialist in creating new Ambler nodes following the project's patterns (namespace, local state, injected utils, edges, and unit tests).
metadata:
  author: Gemini CLI
  version: "1.0"
---

# Add Ambler Node

This skill guides you in creating a new Ambler node. Each node must follow the "Node Namespace Pattern" and include a corresponding unit test.

## Instructions

When asked to create a new Ambler node, follow these steps:

### 1. Identify the Node's Purpose and State
- Determine the name of the node (e.g., `processNode`).
- Identify the local `State` interface (only properties used by this node).
- Identify the side-effects required (e.g., logging, I/O) and define the `Utils` type.
- Identify the possible transitions (edges) and define the `Edges` type.

### 2. Create the Node File (`nodes/<nodeName>.ts`)
- Use the **Node Namespace Pattern** from `AGENTS.md`.
- Export a namespace with the node's name (PascalCase).
- Include `State`, `Edges`, `Utils`, `defaultUtils`, and the `create` factory function.

### 3. Create the Test File (`nodes/<nodeName>_test.ts`)
- Use the **Test Pattern** from `AGENTS.md`.
- Import `assertEquals` from `@std/assert`.
- Use mocks for all `Utils`.
- Verify that the node transitions correctly and updates the state as expected.

### 4. Verify the Implementation
- Run `deno test nodes/<nodeName>_test.ts` to ensure the node works correctly.

## Templates

### Node Template (`nodes/myNode.ts`)
```typescript
import { Next, Nextable } from "../ambler.ts";

export namespace MyNode {
  export interface State {
    // Only properties used by this node
    field: string;
  }

  export type Edges<S extends State> = {
    onSuccess: Nextable<S>;
    onError: Nextable<S>;
  };

  export type Utils = {
    log: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    log: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      try {
        // Logic here...
        utils.log(`Processing ${state.field}`);
        return new Next(edges.onSuccess, state);
      } catch (err) {
        return new Next(edges.onError, state);
      }
    };
  }
}
```

### Test Template (`nodes/myNode_test.ts`)
```typescript
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { MyNode } from "./myNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("MyNode should transition to onSuccess when logic succeeds", async () => {
  let captured: MyNode.State | undefined;
  const capture: Nextable<MyNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const edges: MyNode.Edges<MyNode.State> = {
    onSuccess: capture,
    onError: async () => null,
  };

  const mockUtils: MyNode.Utils = {
    log: () => {}, // Mocked log
  };

  const initialState: MyNode.State = { field: "test" };
  const next = await MyNode.create(edges, mockUtils)(initialState);
  await next?.run();

  assertEquals(captured?.field, "test");
});
```

## Guidelines
- **Surgical Changes**: Only modify/create the files necessary for the new node and its tests.
- **Inject Side-Effects**: Never call global I/O directly; always use the `Utils` pattern.
- **Local State**: Ensure the `State` interface is generic enough to be used in a larger walk but specific to the node's requirements.
- **Test Coverage**: Every node MUST have at least one test covering its primary success path.
