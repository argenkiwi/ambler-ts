# Ambler

[![Deno](https://img.shields.io/badge/deno-^1.40-blue.svg)](https://deno.land/)
[![TypeScript](https://img.shields.io/badge/typescript-^5.0-blue.svg)](https://www.typescriptlang.org/)

Ambler is a lightweight Deno/TypeScript state machine framework designed for building programs as executable graphs. It provides the architectural foundation for coding agents to autonomously construct, test, and wire complex workflows, known as **walks**.

## 🚀 Key Features

- **Lazy-Loading Engine**: Efficiently executes graphs by loading nodes only when needed.
- **Factory-Based Architecture**: Decouples logic from wiring, enabling high reusability and testability.
- **Spec-First Workflow**: Integrated Markdown specifications bridge the gap between design and implementation.
- **Agent-Optimized**: Complemented by a suite of dedicated agent skills for automated scaffolding and testing.

---

## 🏁 Quick Start

### For Agentic Development (Recommended)

Install the Ambler skills locally using [`skills`](https://github.com/argenkiwi/skills):

```bash
npx skills add argenkiwi/ambler-ts
```

Bootstrap your project directly from your agent session:

```bash
/ambler-init <target-dir>
```

### For Manual Setup

Use the Deno tasks to initialize or clone a project:

```bash
# Bootstrap a new project at <target-dir>
deno task init <target-dir>

# Clone an existing walk into another project
deno task clone <source-walk-path> <target-dir>
```

> [!TIP]
> `init` scaffolds a complete project structure (`nodes/`, `walks/`, `specs/`, `utils/`) and copies the core `ambler.ts` engine. `clone` accepts the path to a walk file, a node file, or a utility file — in the current project or another — and copies it along with all its dependencies into the target project, initializing it first if needed. When cloning a walk it also registers a deno task in the target's `deno.json`; when cloning a utility it propagates any external npm/jsr dependencies.

---

## 🏗️ Architecture

Ambler programs are built using three core components:

### 1. Nodes (`nodes/`)
Atomic, functional blocks that perform specific tasks. Each node is a factory that accepts:
- **Edges**: A mapping of logical exits to target node IDs.
- **Utils**: Injected dependencies (e.g., CLI output, LLM clients).

### 2. Walks (`walks/`)
The graph definition. A walk wires factories into a concrete execution plan and initiates the runner.

### 3. Specs (`specs/`)
Markdown blueprints that describe the intended behavior and state transitions before a single line of code is written.

---

## 🛠️ Developer Workflow

1.  **Specify**: Define the graph in `specs/`.
2.  **Implement**: Build factory-based nodes in `nodes/`.
3.  **Test**: Verify node logic in `nodes/tests/`.
4.  **Compose**: Wire nodes together in `walks/`.
5.  **Execute**: Run the program with `deno task <name>`.

```bash
# Run all tests
deno test nodes/tests/

# Execute the counter example
deno run walks/counter.ts
```

---

## 🤖 Agent Integration

Ambler is designed to be augmented by agents using these specialized skills:

- `ambler-init`: Bootstraps new projects.
- `ambler-node`: Scaffolds nodes with proper types and interfaces.
- `ambler-test`: Generates comprehensive unit tests for nodes.
- `ambler-walk`: Automatically wires nodes into executable walks based on specs.
- `ambler-spec`: Generates or refines Markdown specifications.
- `ambler-util`: Extracts reusable logic into utility modules.

---

Built with ❤️ by [argenkiwi](https://github.com/argenkiwi)
