---
name: ambler-walk
description: Creates a complete Ambler walk — the TypeScript wiring file (walks/<name>.ts) and the Markdown spec (specs/<name>.md) — and ensures all required nodes exist. Use this whenever a user wants to add a new program or flow to an Ambler project, even if they say "new walk", "add a program", "wire up these nodes", or just describe what they want the app to do.
metadata:
  author: leandro
  version: "2.3"
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

## Step 2 — Consult the Node Registry

Before creating any nodes, read `nodes/NODES.md`. This file has one entry per existing node — a single file read gives you the full picture.

For each step the walk requires:

1. Scan `nodes/NODES.md` for rows whose `category` or description matches the domain.
2. For candidates, compare the `reads` and `writes` columns against the walk's evolving shared `State`. A node is reusable when the walk's `State` contains all the fields listed, with compatible types.
3. **Prefer reuse.** Only invoke `/ambler-node` to create a new node if no existing node covers the required behaviour. Document reuse decisions with a comment above the import in the walk file:
   `// Reused: init-setup.ts — creates directory structure`
4. If an existing node almost matches but uses different field names, create a thin adapter node (see `/ambler-node` § Adapter Nodes) rather than duplicating logic.

> If `nodes/NODES.md` does not exist yet, run `deno task index-nodes` to generate it, or create it manually before proceeding.

---

## Step 3 — Ensure Nodes Exist

For each node the walk requires:

- Check if a file `nodes/<nodeName>.ts` already exists (use Glob).
- If it does **not** exist, create it using the `/ambler-node` skill **before** writing the walk.
- Also ensure `nodes/tests/<nodeName>.test.ts` exists for every new node using the `/ambler-test` skill, then verify with `deno test nodes/tests/<nodeName>.test.ts`.

---

## Step 4 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec **before** the TypeScript file using the `/ambler-spec` skill, so it acts as a blueprint.

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

## Step 6 — Add Deno Task

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

## Step 7 — Verify

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

- [ ] `nodes/NODES.md` was consulted before creating any nodes.
- [ ] All new nodes have their `nodes/NODES.md` entry added (or run `deno task index-nodes`).
- [ ] No `TODO` placeholders remain in any node metadata blocks used by this walk.
- [ ] `specs/<name>.md` exists and matches the node names in the `.ts` file.
- [ ] `walks/<name>.ts` exists with the correct `State`, `initialState`, and wired `nodes`.
- [ ] Every node used in the walk has a corresponding `nodes/<nodeName>.ts`.
- [ ] Every new node has a `nodes/tests/<nodeName>.test.ts` with at least one test.
- [ ] All tests pass.
- [ ] `deno.json` has a task for `<name>` with the correct permission flags.
- [ ] The walk runs end-to-end without errors.
