---
name: ambler-spec
description: Creates or updates a Markdown specification file for an Ambler walk in the specs/ directory. Use this whenever a user wants to document, plan, or describe a walk — including "write a spec", "document this walk", or "plan out the nodes" — even before any code exists.
metadata:
  author: leandro
  version: "2.0"
---

# Ambler Specification

This skill guides you in creating a Markdown specification file (`specs/<walk-name>.md`) for an Ambler walk. These specs describe the program's flow (nodes and edges) and the resulting shared state.

## Instructions

### 1. Identify the Walk's Name and Purpose

- If not provided, ask the user for the name and a brief description of the walk.
- The file should be named `specs/<name>.md`.

### 2. Map the Nodes and Edges

- Identify all **Nodes** in the walk (the discrete states or steps).
- For each node, identify its **Edges** (the possible transitions to other nodes).
- For each node, create a `### <Node Name>` subsection under `## Nodes`.
- Describe:
  - Its role (e.g., "Initial node").
  - Its logic (what it does).
  - Its edges (what conditions lead to which next node).

### 3. Determine the Shared State

- Aggregating the inputs required and outputs produced by all nodes.
- Identify the data structure that must be maintained throughout the walk to satisfy these node requirements.
- Describe it under a `## Shared State` heading.

### 4. Format the Markdown

Follow this exact format:

```markdown
# Program Specifications

<Brief description of the program and its purpose.>

## Nodes

### <Node Name 1>
- <Role — e.g., "Initial node.">
- <Logic — e.g., "Prompts the user to enter X.">
- <Edges — e.g., "If valid, transitions to `NEXT`. If invalid, transitions to `START`.">

### <Node Name 2>
- <Role.>
- <Logic.>
- <Edges.>

### <Node Name N>
- <Role — e.g., termination node.>
- <Logic.>
- <Termination — e.g., "Displays result and terminates.">

## Shared State

<Description of the state object, derived from the collective needs of the nodes.>
```

### 5. Write the File

Use the Write tool to create `specs/<name>.md`.

## Guidelines

- **Node name casing**: Use Title Case for headings (`### Count`) and backtick-quoted ALL_CAPS for references in edge descriptions (`` `COUNT` ``).
- **Clarity**: Describe *what* the program does, not *how* the code implements it.
- **Consistency**: If `walks/<name>.ts` already exists, ensure the spec reflects the implementation. If it doesn't, treat the spec as a blueprint.
- **No extra sections**: Stick to `# Program Specifications`, `## Nodes`, and `## Shared State` — no additional top-level sections unless the walk clearly requires them.
- **Pragmatic State**: Don't guess the state first; look at what each node needs to know or change, and then define the state.

## Example Specification

```markdown
# Program Specifications

This program is a simple counter application.

## Nodes

### Start
- Initial node of the application.
- Prompts the user to enter a starting number for the count.
- If the number entered is valid, it transitions to `COUNT`.
- If the number entered is invalid, it displays an error message and transitions to `START`.

### Count
- Prints the current count and increments the counter.
- Transitions to `COUNT` or to `STOP`.

### Stop
- Displays the final count and terminates.

## Shared State

The shared state consists of:
- `count`: An integer representing the current value.
```
