---
name: add-walk
description: Creates a new Ambler walk; the TypeScript wiring file (walks/<name>.ts) and the Markdown specification (specs/<name>.md). Ensures any required nodes exist or creates them. Use this when the user wants to add a new state-machine program to the project.
metadata:
  author: leandro
  version: "1.0"
---

# Add Walk

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
- If it does **not** exist, create it **before** writing the walk. Follow the Node Namespace Pattern below.
- Also create `nodes/<nodeName>_test.ts` for every new node and verify tests pass with `deno test nodes/<nodeName>_test.ts`.

### Node Namespace Pattern

Every node in `nodes/` follows this exact structure:

```typescript
// nodes/myNode.ts
import { Next, Nextable } from "../ambler.ts";

export namespace MyNode {
  export interface State {
    // Only the properties this node uses
    field: string;
  }

  export type Edges<S extends State> = {
    onSuccess: Nextable<S>;
    onError: Nextable<S>;
  };

  export type Utils = {
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      // Node logic here
      utils.print(`...`);
      return new Next(edges.onSuccess, state);
    };
  }
}
```

**Terminal nodes** (no outgoing edges) omit `Edges` and return `null`:

```typescript
export function create<S extends State>(
  utils: Utils = defaultUtils,
): Nextable<S> {
  return async (state: S): Promise<null> => {
    utils.print(`Done: ${state.field}`);
    return null;
  };
}
```

### Node Test Pattern

```typescript
// nodes/myNode_test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { MyNode } from "./myNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("MyNode should transition to onSuccess", async () => {
  let captured: MyNode.State | undefined;
  const capture: Nextable<MyNode.State> = async (s) => { captured = s; return null; };

  const mockUtils: MyNode.Utils = {
    print: () => {},
  };

  const next = await MyNode.create({ onSuccess: capture, onError: async () => null }, mockUtils)(
    { field: "test" },
  );
  await next?.run();

  assertEquals(captured?.field, "test");
});
```

**Rules for nodes:**
- Define a local `State` interface with only the properties the node needs.
- Inject all side-effects via `Utils` — never call `console.log`, `prompt`, `Math.random`, etc. directly.
- Never hardcode transitions; always use the `edges` parameter.
- Never use `export default`.

---

## Step 3 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec **before** the TypeScript file, so it acts as a blueprint.

Follow the exact format of `specs/counter.md`:

```markdown
# Program Specifications

<Brief description of the program and its purpose.>

## Shared State

<Description of the State interface properties.>

## Steps

### <Node Name 1>
- This is the initial step of the application.
- <What it does — inputs, logic.>
- <Transitions: "If X, it proceeds to `NEXT_STEP`." Use ALL_CAPS backtick names for step references.>

### <Node Name 2>
- <Role.>
- <Logic.>
- <Transitions.>

### <Node Name N>
- <Role — this is the terminal step.>
- <What it displays or does.>
- <Termination: "Terminates the process." / "Returns null.">
```

**Formatting rules:**
- Section heading: `# Program Specifications` (no sub-title).
- Step headings: `### Title Case` (e.g. `### Count`).
- Step cross-references in prose: backtick ALL_CAPS (e.g. `` `COUNT` ``).
- Use bullet points (`-`) for all step descriptions.

---

## Step 4 — Create the Wiring File (`walks/<name>.ts`)

Use the Wiring Pattern from `AGENTS.md`:

```typescript
import { amble, node, Nextable } from "../ambler.ts";
import { NodeA } from "../nodes/nodeA.ts";
import { NodeB } from "../nodes/nodeB.ts";
import { NodeC } from "../nodes/nodeC.ts";

export interface State {
  field: string;
}

const initialState: State = {
  field: "initial",
};

// Wire the graph using a record to store node factories
const nodes: Record<string, Nextable<State>> = {
  start: node(() => NodeA.create({ onSuccess: nodes.next, onError: nodes.start })),
  next:  node(() => NodeB.create({ onComplete: nodes.stop })),
  stop:  node(() => NodeC.create()),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
```

**Key rules:**
- Import `amble`, `node`, `Nextable` from `../ambler.ts`.
- Define `State` interface and `initialState` at the top of the file.
- Use `Record<string, Nextable<State>>` for the `nodes` object.
- Always wrap node creation in `node(() => ...)` to handle circular/forward references.
- Include the `if (import.meta.main)` guard.

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
- [ ] Every new node has a `nodes/<nodeName>_test.ts` with at least one test.
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
| `ambler.ts` | Core primitives: `Nextable`, `Next`, `node`, `amble` |
| `AGENTS.md` | Project standards and patterns |
