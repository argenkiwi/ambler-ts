---
name: ambler-walk
description: Creates a complete Ambler walk — the TypeScript wiring file (walks/<name>.ts) and the Markdown spec (specs/<name>.md) — and ensures all required nodes exist. Use this whenever a user wants to add a new program or flow to an Ambler project, even if they say "new walk", "add a program", "wire up these nodes", or just describe what they want the app to do.
metadata:
  author: leandro
  version: "2.4"
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

## Step 2 — Research and Reuse

Before creating new nodes, research existing ones to promote reuse and consistency:

- **Review Existing Specs:** Browse `specs/*.md` to identify nodes that already implement the required logic (e.g., "Ollama Check", "Model Select"). This is more efficient than reading source code and helps maintain architectural alignment.
- **Check Node Implementation:** For each node identified, verify its existence in `nodes/<nodeName>.ts`.

---

## Step 3 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec using the `/ambler-spec` skill. This acts as the **blueprint** for the entire walk, defining the shared state and the logic for every node.

---

## Step 4 — Ensure Nodes Exist

For each node defined in the specification:

- If it does **not** exist in `nodes/<nodeName>.ts`, create it using the `/ambler-node` skill. This runs a full TDD pass — skeleton, tests (red), implementation, tests (green) — before completing. No separate test step is needed.
- If the node already exists but has no tests, use the `/ambler-test` skill to retrofit coverage.

---

## Step 5 — Create the Wiring File (`walks/<name>.ts`)

```typescript
import { ambler } from "../ambler.ts";
import { factory as startNode } from "../nodes/start.ts";
import { factory as nextNode } from "../nodes/next.ts";
import { factory as stopNode } from "../nodes/stop.ts";

export interface State {
  field: string;
}

type NodeId = "start" | "next" | "stop";

const amble = ambler<State, NodeId>({
  start: () => startNode({ onSuccess: "next", onError: "start" }),
  next:  () => nextNode({ onComplete: "stop" }),
  stop:  () => stopNode({ onDone: null }),
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
- Import `ambler` from `../ambler.ts`.
- Import each node's `factory` as a named import and alias it for clarity.
- Define `State` interface at the top of the file.
- Define `NodeId` union type for node identifiers.
- Provide a map of node IDs to **functions that return nodes** to `ambler<State, NodeId>({ ... })`.
- Use arrow functions to defer node creation: `start: () => startNode({ ... })`.
- Call `ambler` outside the `if` guard and use `instanceof Promise` in the loop.

---

## Step 5 — Add Deno Task

Add (or update) an entry in `deno.json` under `tasks` for this walk:

```json
"<name>": "deno run [permissions] walks/<name>.ts"
```

Choose permissions based on the Deno APIs used by the walk's nodes:

| API used by nodes | Permission flag |
|---|---|
| `Deno.readTextFile`, `Deno.copyFile`, `Deno.stat` | `--allow-read` |
| `Deno.writeTextFile`, `Deno.mkdir`, `Deno.copyFile` (dst) | `--allow-write` |
| `Deno.env` | `--allow-env` |
| `fetch` / network calls | `--allow-net` |
| None of the above (only stdin/stdout) | *(no flags needed)* |

Example for a walk with file I/O:

```json
"my-walk": "deno run --allow-read --allow-write walks/my-walk.ts"
```

Users pass arguments after the task name: `deno task my-walk <arg1> <arg2>`

---

## Step 6 — Verify

Run the walk to confirm it behaves as specified:

```
deno task <name>
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
- [ ] Every node used in the walk has a corresponding `nodes/<nodeName>.ts` and passing tests (enforced by `/ambler-node`).
- [ ] All tests pass (`deno test nodes/tests/`).
- [ ] `deno.json` has a task for `<name>` with the correct permission flags.
- [ ] The walk runs end-to-end without errors.
