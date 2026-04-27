# Ambler

Ambler is a Deno/TypeScript state machine framework designed to provide the building blocks for a coding agent to write programs represented as graphs. These programs, called **walks**, are composed of individual **nodes** and **edges**, enabling the creation of complex command-line applications and agentic workflows.

## Starting a New Project

### Option 1 — via the skills CLI (recommended)

Install all Ambler skills globally using [`npx skills`](https://github.com/vercel-labs/skills):

```bash
npx skills add argenkiwi/ambler-ts -g
```

Then bootstrap a new project from any Claude Code session:

```bash
/ambler-init <target-dir>
```

To keep skills up to date after future changes to this repo:

```bash
npx skills update ambler-init
```

### Option 2 — via Deno (no npm required)

Run `init.ts` directly from this repo:

```bash
deno run --allow-write --allow-read init.ts <target-dir>
```

Both options create the folder structure (`nodes/`, `walks/`, `specs/`), copy `ambler.ts`, generate a minimal `deno.json`, and install the agent skills — ready to use with no sample code.

## Goals

The core objective of Ambler is to enable an agent to programmatically construct executable graphs. By representing logic as a series of nodes, it becomes possible for an agent to:
- Define individual atomic steps (nodes) with clear inputs and outputs.
- Wire these steps together into complex, directed graphs (walks).
- Create reusable, testable components for CLI tools and automated workflows.

## Architecture

The framework follows a graph-based execution model:

- **Core Engine (`ambler.ts`)**: Implements the `amble` function which drives the machine through the graph. It manages the execution loop, transitioning from one node to the next until the process terminates.
- **Nodes (`nodes/`)**: The fundamental building blocks. Each node is a function that performs a specific task (e.g., prompting the user, calling an LLM, processing data) and returns the next step to execute. Termination is expressed in the walk wiring via `stop()`. Nodes are designed for testability through dependency injection of utilities like `print`, `sleep`, and `random`.
- **Walks (`walks/`)**: The concrete implementation of a program. A walk wires nodes together into a specific graph structure and initiates the execution.
- **Specs (`specs/`)**: Design documents written in Markdown that describe the intended behavior of a walk before implementation. This provides a blueprint for both humans and agents.
- **Utilities (`utils/`)**: Reusable logic and helpers used across nodes and walks.

## Developer Workflow

### 1. Define a Specification
Before implementing a new walk, create a specification in the `specs/` directory. This `.md` file should clearly outline the nodes involved and the transitions between them.

### 2. Implement Nodes
When a new node is needed, implement it in the `nodes/` directory. Follow the pattern of using a factory function that accepts injected dependencies.

### 3. Compose a Walk
Create a new walk in `walks/` by importing the necessary nodes and defining their connections.

### 4. Test and Execute
- **Testing Nodes**: Each node should have a corresponding test file in `nodes/` (e.g., `myNode.test.ts`). Run tests using:
  ```bash
  deno test
  ```
  To run a specific node test:
  ```bash
  deno test nodes/myNode.test.ts
  ```
- **Running Walks**: Execute a complete walk directly using `deno run`:
  ```bash
  deno run walks/counter.ts
  ```
- **Development Mode**: For certain walks, you can use the dev task to run with file watching:
  ```bash
  deno task dev
  ```

## Leveraging Skills

Ambler is designed to be used with agents equipped with **skills**. These skills can automate the creation of the entire lifecycle:
- `add-node`: Scaffolds a new node with the correct structure and dependencies.
- `add-node-test`: Generates a comprehensive test suite for an existing node.
- `add-walk`: Creates a new walk and its corresponding specification.
- `add-walk-spec`: Generates a new specification file.

By using these skills, an augmented agent can efficiently expand the project's capabilities, turning high-level requirements (specs) into executable code (nodes and walks).
