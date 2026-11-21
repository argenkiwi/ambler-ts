# Ambler

[![Bun](https://img.shields.io/badge/bun-^1.4-blue.svg)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/typescript-^7.0-blue.svg)](https://www.typescriptlang.org/)

Ambler is a lightweight Bun/TypeScript state machine framework designed for building programs as executable graphs. It provides the architectural foundation for coding agents to autonomously construct, test, and wire complex workflows, known as **walks**.

## 🚀 Key Features

- **Lazy-Loading Engine**: Efficiently executes graphs by loading nodes only when needed.
- **Factory-Based Architecture**: Decouples logic from wiring, enabling high reusability and testability.
- **Spec-First Workflow**: Integrated Markdown specifications bridge the gap between design and implementation.
- **Agent-Optimized**: Complemented by a suite of dedicated agent skills for automated scaffolding and testing.

---

## 🏁 Quick Start

Install the Ambler skills locally using [`skills`](https://github.com/argenkiwi/skills):

```bash
npx skills add argenkiwi/ambler-ts
```

---

## 🏗️ Architecture

Ambler programs are built using three core components:

### 1. Nodes (`nodes/`)
Atomic, functional blocks that perform specific tasks. Each node is a factory that accepts:
- **Edges**: A mapping of logical exits to target node IDs.
- **Utils**: Injected dependencies (e.g., CLI output, LLM clients).

### 2. Walks (`walks/`)
The graph definition. A walk exports `createWalk(utils)`, which wires factories into a concrete execution plan (with optional per-node utils overrides for tests), and runs it with `walk(amble, startId, initialState)`. `walk()` returns the final state and wraps any error a node throws in a `WalkError` that names the node.

### 3. Specs (`specs/`)
Markdown blueprints that describe the intended behavior and state transitions before a single line of code is written.

### 4. Zettelkasten-RAG (`notes/` + `.azk/`)
`azk` is a standalone tool (its own repo, built with Ambler) that any project — including this one — can use as a knowledge store. Notes are version-controlled Markdown files with YAML frontmatter under `notes/` (Obsidian/HelixNotes-compatible); `.azk/` is a derived, gitignored SQLite index rebuildable at any time. It gives a coding agent a global `azk` command with seven independent subcommands (`azk search`, `azk create`, `azk get`, `azk update`, `azk delete`, `azk link`, `azk reindex`) to retrieve prior design decisions before implementing a prompt and record new learnings after — atomic, explicitly-linked notes, searched via full-text keyword match blended with optional semantic embeddings. This project's own `AGENTS.md` enforces the retrieve-before/store-after protocol on every prompt, backed by the globally-installed `azk` binary (see the `azk` repo's `azk-install` skill).

---

## 🛠️ Developer Workflow

1.  **Specify**: Define the graph in `specs/`.
2.  **Implement**: Build factory-based nodes in `nodes/`.
3.  **Test**: Verify node logic in `nodes/tests/`.
4.  **Compose**: Wire nodes together in `walks/`, and test the wiring in `walks/tests/`.
5.  **Execute**: Run the program with `bun run <name>`.

```bash
# Run all node and walk tests
bun run test

# Type-check, lint and check formatting
bun run check
bun run lint

# Execute the counter example
bun walks/counter.ts
```

---

## 🤖 Agent Integration

Ambler is designed to be augmented by agents using these specialized skills:

- `ambler-node`: Scaffolds nodes with proper types and interfaces.
- `ambler-test`: Generates comprehensive unit tests for nodes.
- `ambler-walk`: Automatically wires nodes into executable walks based on specs.
- `ambler-spec`: Generates or refines Markdown specifications.
- `ambler-util`: Extracts reusable logic into utility modules.

---

Built with ❤️ by [argenkiwi](https://github.com/argenkiwi)
