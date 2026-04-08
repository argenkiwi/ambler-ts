---
name: add-walk-spec
description: Specialist in creating and updating Markdown specifications for Ambler walks. Use this when a user wants to document a new or existing walk in the 'specs/' directory.
metadata:
  author: Gemini CLI
  version: "1.0"
---

# Add Walk Specification

This skill guides you in creating or updating a Markdown specification file (e.g., `specs/<walk-name>.md`) for an Ambler walk. These specifications provide a high-level overview of the program's shared state and the logic for each transition (edge) in the state machine.

## Instructions

When asked to create a walk specification, follow these steps:

### 1. Identify the Walk's Name and Purpose
- If not provided, ask the user for the name and a brief description of the walk.
- The file should be named `specs/<name>.md`.

### 2. Determine the Shared State
- Identify the data structure that is passed between nodes.
- In the Markdown file, describe this state under a `## Shared State` heading.

### 3. Map the Steps (Nodes)
- Identify all nodes in the walk.
- For each node, create a `### <Node Name>` subsection under a `## Steps` heading.
- For each node, describe:
  - Its role (e.g., "This is the initial step").
  - Its logic (what it does, e.g., "Prompts the user to enter a starting number").
  - Its transitions (what happens after it completes, e.g., "If the input is empty, it proceeds to `COUNT`").

### 4. Format the Markdown
- Follow the exact format of `specs/counter.md`:
  - Main title: `# Program Specifications`
  - Introduction paragraph.
  - `## Shared State` section.
  - `## Steps` section with `###` subsections for each node.

## Template

```markdown
# Program Specifications

<Brief description of the program and its purpose within the Ambler framework.>

## Shared State

<Description of the state object shared across the nodes.>

## Steps

### <Node Name 1> (Initial Step)
- <Bullet point describing its role.>
- <Bullet point describing its logic/inputs.>
- <Bullet point describing its transitions/edges.>

### <Node Name 2>
- <Bullet point describing its role.>
- <Bullet point describing its logic/inputs.>
- <Bullet point describing its transitions/edges.>

...

### <Node Name N> (Final Step)
- <Bullet point describing its role.>
- <Bullet point describing its logic/inputs.>
- <Bullet point describing its termination logic.>
```

## Guidelines

- **Consistency**: Ensure the node names match the naming convention in `walks/*.ts` and `nodes/*.ts`.
- **Clarity**: Use clear, concise language that explains *what* the program does rather than *how* the code is written.
- **Verification**: If the code (`walks/<name>.ts`) already exists, ensure the specification accurately reflects the implementation. If the code does not exist, use the specification as a blueprint for implementation.
