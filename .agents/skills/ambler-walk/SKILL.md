---
name: ambler-walk
description: Creates a complete Ambler walk — the TypeScript wiring file (walks/<name>.ts) and the Markdown spec (specs/<name>.md) — and ensures all required nodes exist. Use this whenever a user wants to add a new program or flow to an Ambler project, even if they say "new walk", "add a program", "wire up these nodes", or just describe what they want the app to do.
metadata:
  author: leandro
  version: "1.3"
---

# Ambler Walk

This skill guides you in creating a complete Ambler walk. A walk is a state-machine program consisting of two files:

1. `walks/<name>.ts` — TypeScript file defining the shared `State`, `initialState`, and the wired node graph.
2. `specs/<name>.md` — Markdown specification describing the shared state and the logic/transitions of each step.

---

## Step 1 — Identify the Walk

- Determine the walk name (lowercase, hyphen-separated, e.g. `my-walk`). The file will be `walks/<name>.ts`.
- Clarify the walk's purpose: what program does it implement?
- Identify the nodes (steps) required and their transitions.

---

## Step 2 — Ensure Nodes Exist

For each node the walk requires:

- Check if a file `nodes/<nodeName>.ts` already exists (use Glob).
- If it does **not** exist, create it using the `/ambler-node` skill **before** writing the walk.
- Also ensure `nodes/tests/<nodeName>.test.ts` exists for every new node using the `/ambler-test` skill, then verify with `deno test nodes/tests/<nodeName>.test.ts`.

---

## Step 3 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec **before** the TypeScript file using the `/ambler-spec` skill, so it acts as a blueprint.

---

## Step 4 — Create the Wiring File (`walks/<name>.ts`)

```typescript
import { ambler, defer } from "../ambler.ts";
import { factory as startNodeFactory } from "../nodes/startNode.ts";
import { factory as nextNodeFactory } from "../nodes/nextNode.ts";
import { factory as stopNodeFactory } from "../nodes/stopNode.ts";

export interface State {
  field: string;
}

type NodeId = "start" | "next" | "stop";

const amble = ambler<State, NodeId>({
  start: defer(() => startNodeFactory<State, NodeId>({ onSuccess: "next", onError: "start" })),
  next:  defer(() => nextNodeFactory<State, NodeId>({ onComplete: "stop" })),
  stop:  defer(() => stopNodeFactory<State, NodeId>({ onDone: null })),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    field: "initial",
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
```

**Key rules:**
- Import `ambler`, `defer`, and optionally `adapt` from `../ambler.ts`.
- Import each node factory as a **named import** (e.g., `import { factory as startNodeFactory } from "../nodes/startNode.ts"`).
- Define `State` interface at the top of the file.
- Define `NodeId` union type for node identifiers.
- Use `ambler<State, NodeId>({ ... })` to create the executor, passing a record of node IDs to node implementations.
- Use `defer(() => factory<State, NodeId>(edges, utils))` for lazy initialization and to break circular dependencies. Always provide explicit type parameters `<State, NodeId>` to the factory to ensure proper type inference.
- Use `adapt` to wrap nodes that operate on a different state type.
- The main loop uses `instanceof Promise` to handle both sync and async nodes: `[nodeId, state] = next instanceof Promise ? await next : next`.

---

## Step 5 — Verify

Run the walk to confirm it behaves as specified:

```
deno run --allow-all walks/<name>.ts
```

If the walk has new nodes, also run:

```
deno test nodes/tests/
```

---

## Checklist

Before finishing, confirm:

- [ ] `specs/<name>.md` exists and matches the node names in the `.ts` file.
- [ ] `walks/<name>.ts` exists with the correct `State`, `initialState`, and wired `nodes`.
- [ ] Every node used in the walk has a corresponding `nodes/<nodeName>.ts`.
- [ ] Every new node has a `nodes/tests/<nodeName>.test.ts` with at least one test.
- [ ] All tests pass.
- [ ] The walk runs end-to-end without errors.

