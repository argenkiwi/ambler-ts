# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run tests
deno test

# Run a single test file
deno test nodes/startNode.test.ts

# Run the counter walk (dev mode with file watching)
deno task dev

# Run a walk directly
deno run walks/counter.ts
```

## Architecture

**Ambler** is a Deno/TypeScript state machine framework. The core execution model lives in `ambler.ts`:

- `Nextable<S>` — a function `(state: S) => Promise<Next<S> | null>` representing a node in the graph
- `Next<S>` — wraps the next `Nextable` and updated state; calling `.run()` advances the machine
- `node(factory)` — wraps a node factory so it re-runs each time (enabling cyclic graphs without circular reference issues)
- `amble(start, initialState)` — drives the machine until a node returns `null`

**Nodes** (`nodes/`) implement individual steps. Each node is created via a factory that accepts typed transition callbacks (`onSuccess`, `onError`, `onCount`, etc.) and injectable utilities (`print`, `sleep`, `random`, `readLine`) for testability. Nodes return `Next` pointing to the next node, or `null` to terminate.

**Walks** (`walks/`) wire nodes into concrete graphs and call `amble()`. The `nodes` record uses forward references resolved lazily via `node()`.

**Specs** (`specs/`) contain plain-language descriptions of walk behavior, used as design documents before implementation.

The pattern for adding a new walk: write a spec in `specs/`, implement nodes in `nodes/` with full dependency injection, compose them in `walks/`, and add tests alongside each node file.
