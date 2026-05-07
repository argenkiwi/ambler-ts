---
name: ambler-walk
description: Creates a complete Ambler walk — the TypeScript wiring file (walks/<name>.ts) and the Markdown spec (specs/<name>.md) — and ensures all required cores exist. Use this whenever a user wants to add a new program or flow to an Ambler project, even if they say "new walk", "add a program", "wire up these cores", or just describe what they want the app to do.
metadata:
  author: leandro
  version: "1.4"
---

# Ambler Walk

This skill guides you in creating a complete Ambler walk. A walk is a state-machine program consisting of two files:

1. `walks/<name>.ts` — TypeScript file defining the shared `State`, `initialState`, and the wired core graph.
2. `specs/<name>.md` — Markdown specification describing the shared state and the logic/transitions of each step.

---

## Step 1 — Identify the Walk

- Determine the walk name (lowercase, hyphen-separated, e.g. `my-walk`). The file will be `walks/<name>.ts`.
- Clarify the walk's purpose: what program does it implement?
- Identify the cores (steps) required and their transitions.

---

## Step 2 — Ensure Cores Exist

For each core the walk requires:

- Check if a file `cores/<coreName>.ts` already exists (use Glob).
- If it does **not** exist, create it using the `/ambler-core` skill **before** writing the walk.
- Also ensure `cores/tests/<coreName>.test.ts` exists for every new core using the `/ambler-test` skill, then verify with `deno test cores/tests/<coreName>.test.ts`.

---

## Step 3 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec **before** the TypeScript file using the `/ambler-spec` skill, so it acts as a blueprint.

---

## Step 4 — Create the Wiring File (`walks/<name>.ts`)

```typescript
import { ambler } from "../ambler.ts";
import { factory as startFactory } from "../cores/start.ts";
import { factory as nextFactory } from "../cores/next.ts";
import { factory as stopFactory } from "../cores/stop.ts";

export interface State {
  field: string;
}

type NodeId = "start" | "next" | "stop";

const amble = ambler<State, NodeId>({
  start: () => {
    const core = startFactory({ onSuccess: "next", onError: "start" });
    return async (state) => {
      const [nodeId, output] = await core(state.field);
      return [nodeId, { ...state, field: output }];
    };
  },
  next: () => {
    const core = nextFactory({ onComplete: "stop" });
    return async (state) => {
      const [nodeId, output] = await core(state.field);
      return [nodeId, { ...state, field: output }];
    };
  },
  stop: () => {
    const core = stopFactory({ onDone: null });
    return (state) => {
      const [nodeId, _] = core(state.field);
      return [nodeId, state];
    };
  },
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
- Import each core factory as a **named import** (e.g., `import { factory as startFactory } from "../cores/start.ts"`).
- Define `State` interface at the top of the file.
- Define `NodeId` union type for core identifiers.
- Each entry in `ambler` is a **thunk** `() => Node<State, NodeId>`. Inside the thunk, instantiate the core (no explicit `<NodeId>` generic needed — TypeScript infers it) and return a node function `(state) => Next`.
- The thunk is called once on first use; the resulting node is cached by the engine for all subsequent steps.
- Manually manage state updates (e.g., using spread operator `{ ...state, field: newValue }`).
- The main loop uses `instanceof Promise` to handle both sync and async ambler steps: `[nodeId, state] = next instanceof Promise ? await next : next`.

---

## Step 5 — Verify

Run the walk to confirm it behaves as specified:

```
deno run --allow-all walks/<name>.ts
```

If the walk has new cores, also run:

```
deno test cores/tests/
```

---

## Checklist

Before finishing, confirm:

- [ ] `specs/<name>.md` exists and matches the core names in the `.ts` file.
- [ ] `walks/<name>.ts` exists with the correct `State`, initial state inline in the main loop, and wired cores.
- [ ] Every core used in the walk has a corresponding `cores/<coreName>.ts`.
- [ ] Every new core has a `cores/tests/<coreName>.test.ts` with at least one test.
- [ ] All tests pass.
- [ ] The walk runs end-to-end without errors.

