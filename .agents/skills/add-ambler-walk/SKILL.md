---
name: add-ambler-walk
description: Specialist in creating new Ambler walks, including the TypeScript wiring file and the Markdown specification file, following project patterns.
metadata:
  author: Gemini CLI
  version: "1.0"
---

# Add Ambler Walk

This skill guides you in creating a new Ambler walk. A walk consists of two files:
1. `walks/<walk-name>.ts`: The TypeScript file that defines the state and wires the nodes together.
2. `walks/<walk-name>.md`: The Markdown specification for the walk.

## Instructions

When asked to create a new Ambler walk, follow these steps:

### 1. Identify the Walk's Name and Purpose
- Determine the name of the walk (e.g., `processWalk`).
- Identify the shared `State` interface and the `initialState`.

### 2. Create the Specification File (`walks/<walk-name>.md`)
- Follow the format defined in the `add-walk-spec` skill.
- Describe the shared state and the logic for each node (step).
- Ensure the descriptions match the intended behavior.

### 3. Create the Wiring File (`walks/<walk-name>.ts`)
- Use the **Wiring Pattern** from `AGENTS.md`.
- Import `amble`, `node`, and `Nextable` from `../ambler.ts`.
- Import the required node namespaces from `../nodes/`.
- Define the `State` interface and `initialState`.
- Wire the graph using a `Record<string, Nextable<State>>` called `nodes`.
- Use the `node(() => ...)` lazy factory to handle circular references.
- Include the `if (import.meta.main)` block to drive the event loop.

### 4. Verify the Walk
- Run the walk using `deno run --allow-all walks/<walk-name>.ts`.
- Ensure the behavior matches the specification.

## Templates

### Wiring Template (`walks/myWalk.ts`)
```typescript
import { amble, node, Nextable } from "../ambler.ts";
import { NodeA } from "../nodes/nodeA.ts";
import { NodeB } from "../nodes/nodeB.ts";

export interface State {
  // Shared state properties
  field: string;
}

const initialState: State = {
  field: "initial",
};

// Wire the graph using a record to store node factories
const nodes: Record<string, Nextable<State>> = {
  start: node(() => NodeA.create({ onSuccess: nodes.next, onError: nodes.start })),
  next: node(() => NodeB.create({ onComplete: nodes.stop })),
  stop: node(() => { /* Terminal node logic */ return async () => null; }),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
```

### Specification Template (`walks/myWalk.md`)
```markdown
# Program Specifications

<Brief description.>

## Shared State

<Description of State properties.>

## Steps

### Start
- <Description of StartNode logic and transitions.>

### Next
- <Description of NodeB logic and transitions.>
```

## Guidelines
- **Consistency**: Node names in the specification MUST match the node names in the TypeScript file.
- **Modularity**: Use existing nodes from `nodes/` whenever possible. If a new node is needed, use the `add-ambler-node` skill first.
- **Lazy Wiring**: Always use the `node(() => ...)` pattern to ensure all node references are available at runtime.
