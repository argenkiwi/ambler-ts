---
name: ambler-walk
description: Creates a complete Ambler walk — the TypeScript wiring file (walks/<name>.ts) and the Markdown spec (specs/<name>.md) — and ensures all required nodes exist. Use this whenever a user wants to add a new program or flow to an Ambler project, even if they say "new walk", "add a program", "wire up these nodes", or just describe what they want the app to do.
metadata:
  author: leandro
  version: "1.1"
---

# Ambler Walk

This skill guides you in creating a complete Ambler walk. A walk is a state-machine program consisting of two files:

1. `walks/<name>.ts` — TypeScript file defining the shared `State`, `initialState`, and the wired node graph.
2. `specs/<name>.md` — Markdown specification describing the shared state and the logic/transitions of each step.

The canonical reference is `walks/counter.ts` and `specs/counter.md`.

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
- Also ensure `nodes/<nodeName>.test.ts` exists for every new node using the `/ambler-test` skill, then verify with `deno test nodes/<nodeName>.test.ts`.

---

## Step 3 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec **before** the TypeScript file using the `/ambler-spec` skill, so it acts as a blueprint.

---

## Step 4 — Create the Wiring File (`walks/<name>.ts`)

```typescript
import { amble, Node } from "../ambler.ts";
import * as NodeA from "../nodes/nodeA.ts";
import * as NodeB from "../nodes/nodeB.ts";
import * as NodeC from "../nodes/nodeC.ts";

export interface State {
  field: string;
}

const initialState: State = {
  field: "initial",
};

type NodeId = "start" | "next" | "stop";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: NodeA.create({ onSuccess: "next", onError: "start" }),
  next:  NodeB.create({ onComplete: "stop" }),
  stop:  NodeC.create({ onDone: null }),
};

if (import.meta.main) {
  await amble(nodes, "start", initialState);
}
```

**Key rules:**
- Import `amble`, `Node` from `../ambler.ts`. Import `ambler` only if you need the single-step executor directly.
- Import each node module with `import * as <Name>Node from "../nodes/<name>Node.ts"`.
- Define `State` interface and `initialState` at the top of the file.
- Define `NodeId` union type for node identifiers.
- Use `Record<NodeId, Node<State, NodeId>>` for the `nodes` object.
- Include the `if (import.meta.main)` guard using `ambler(nodes)`.

---

## Step 5 — Verify

Run the walk to confirm it behaves as specified:

```
deno run --allow-all walks/<name>.ts
```

If the walk has new nodes, also run:

```
deno test nodes/
```

---

## Checklist

Before finishing, confirm:

- [ ] `specs/<name>.md` exists and matches the node names in the `.ts` file.
- [ ] `walks/<name>.ts` exists with the correct `State`, `initialState`, and wired `nodes`.
- [ ] Every node used in the walk has a corresponding `nodes/<nodeName>.ts`.
- [ ] Every new node has a `nodes/<nodeName>.test.ts` with at least one test.
- [ ] All tests pass.
- [ ] The walk runs end-to-end without errors.

---

## Reference Files

| File | Purpose |
|------|---------|
| `walks/counter.ts` | Canonical wiring example |
| `specs/counter.md` | Canonical specification example |
| `nodes/startNode.ts` | Example node with input + error handling |
| `nodes/countNode.ts` | Example node with randomized transition |
| `nodes/stopNode.ts` | Example terminal node (returns `null`) |
| `ambler.ts` | Core primitives: `Node`, `Edges`, `Next`, `amble`, `ambler` |
