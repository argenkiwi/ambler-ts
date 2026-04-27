---
name: ambler-walk
description: Creates a new Ambler walk; the TypeScript wiring file (walks/<name>.ts) and the Markdown specification (specs/<name>.md). Ensures any required nodes exist or creates them. Use this when the user wants to add a new state-machine program to the project.
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
- If it does **not** exist, create it **before** writing the walk. Follow the Node Pattern below.
- Also create `nodes/<nodeName>.test.ts` for every new node and verify tests pass with `deno test nodes/<nodeName>.test.ts`.

### Node Pattern

Every node in `nodes/` uses flat module-level exports — no namespace wrapper. Walks import with `import * as MyNode from "../nodes/myNode.ts"`.

```typescript
// nodes/myNode.ts
import { next, Node } from "../ambler.ts";

export interface State {
  // Only the properties this node uses
  field: string;
}

export type Edges<S extends State> = {
  onSuccess: Node<S>;
  onError: Node<S>;
};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Node<S> {
  return async (state: S) => {
    utils.print(`...`);
    return next(edges.onSuccess, state);
  };
}
```

**Terminal nodes** (no outgoing edges) omit `Edges` and return `null`:

```typescript
export function create<S extends State>(
  utils: Utils = defaultUtils,
): Node<S> {
  return async (state: S) => {
    utils.print(`Done: ${state.field}`);
    return null;
  };
}
```

### Node Test Pattern

```typescript
// nodes/myNode.test.ts
import { assertEquals } from "@std/assert";
import * as MyNode from "./myNode.ts";
import { Node } from "../ambler.ts";

Deno.test("myNode should transition to onSuccess", async () => {
  let captured: MyNode.State | undefined;
  const capture: Node<MyNode.State> = async (s) => { captured = s; return null; };

  const mockUtils: MyNode.Utils = {
    print: () => {},
  };

  const nextResult = await MyNode.create(
    { onSuccess: capture, onError: async () => null },
    mockUtils,
  )({ field: "test" });

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult();

  assertEquals(captured?.field, "test");
});
```

**Rules for nodes:**
- Define a local `State` interface with only the properties the node needs.
- Inject all side-effects via `Utils` — never call `console.log`, `prompt`, `Math.random`, etc. directly.
- Never hardcode transitions; always use the `edges` parameter.
- Never use `export default`.
- Use `next(edges.onEdgeName, newState)` (function call) to transition — not `new Next(...)`.

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

```typescript
import { amble, node, Node } from "../ambler.ts";
import * as NodeA from "../nodes/nodeA.ts";
import * as NodeB from "../nodes/nodeB.ts";
import * as NodeC from "../nodes/nodeC.ts";

export interface State {
  field: string;
}

const initialState: State = {
  field: "initial",
};

const nodes: Record<string, Node<State>> = {
  start: node(() => NodeA.create({ onSuccess: nodes.next, onError: nodes.start })),
  next:  node(() => NodeB.create({ onComplete: nodes.stop })),
  stop:  node(() => NodeC.create()),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
```

**Key rules:**
- Import `amble`, `node`, `Node` from `../ambler.ts`.
- Import each node module with `import * as <Name>Node from "../nodes/<name>Node.ts"`.
- Define `State` interface and `initialState` at the top of the file.
- Use `Record<string, Node<State>>` for the `nodes` object.
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
| `ambler.ts` | Core primitives: `Node`, `Next`, `next`, `node`, `amble` |
