---
name: add-walk-spec
description: Creates a Markdown specification file for an Ambler walk in the walks/ directory, following the format of walks/counter.md. Use this when a user wants to document a new or existing walk.
metadata:
  author: leandro
  version: "1.0"
---

# Add Walk Specification

This skill guides you in creating a Markdown specification file (`specs/<walk-name>.md`) for an Ambler walk. These specs describe the program's shared state and the logic for each step (node) in the state machine, following the format established in `specs/counter.md`.

## Instructions

### 1. Identify the Walk's Name and Purpose

- If not provided, ask the user for the name and a brief description of the walk.
- The file should be named `specs/<name>.md`.

### 2. Determine the Shared State

- Identify the data structure passed between nodes.
- Describe it under a `## Shared State` heading.

### 3. Map the Steps (Nodes)

- Identify all nodes in the walk.
- For each node, create a `### <Node Name>` subsection under `## Steps`.
- Describe:
  - Its role (e.g., "This is the initial step").
  - Its logic (what it does).
  - Its transitions (what conditions lead to which next step).

### 4. Format the Markdown

Follow the exact format of `specs/counter.md`:

```markdown
# Program Specifications

<Brief description of the program and its purpose.>

## Shared State

<Description of the state object shared across the nodes.>

## Steps

### <Node Name 1>
- <Role — e.g., "This is the initial step.">
- <Logic — e.g., "Prompts the user to enter X.">
- <Transitions — e.g., "If valid, proceeds to `NEXT`. If invalid, proceeds to `START`.">

### <Node Name 2>
- <Role.>
- <Logic.>
- <Transitions.>

### <Node Name N>
- <Role — e.g., final step.>
- <Logic.>
- <Termination — e.g., "Displays result and terminates.">
```

### 5. Write the File

Use the Write tool to create `specs/<name>.md`.

## Guidelines

- **Node name casing**: Use Title Case for headings (`### Count`) and backtick-quoted ALL_CAPS for references in transition descriptions (`` `COUNT` ``), matching the style in `specs/counter.md`.
- **Clarity**: Describe *what* the program does, not *how* the code implements it.
- **Consistency**: If `walks/<name>.ts` already exists, ensure the spec reflects the implementation. If it doesn't, treat the spec as a blueprint.
- **No extra sections**: Stick to `# Program Specifications`, `## Shared State`, and `## Steps` — no additional top-level sections unless the walk clearly requires them.

## Reference Example

See `specs/counter.md` for the canonical example:

- Shared state is a single integer (the count).
- Three steps: `Start`, `Count`, `Stop`.
- Each step lists role, logic, and transitions as bullet points.
