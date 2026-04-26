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

- `Node<S>` — a function `(state: S) => MaybePromise<Next<S>>` representing a node in the graph
- `Next<S>` — a plain function; calling it advances the machine to the next step
- `stop()` — creates a terminal `Next<S>` that returns `null`; used in walk wiring as `() => stop()`
- `node(factory)` — wraps a node factory so it re-runs each time (enabling cyclic graphs without circular reference issues)
- `amble(start, initialState)` — drives the machine until a node returns `null`

**Nodes** (`nodes/`) implement individual steps. Each node is created via a factory that accepts typed transition callbacks (`onSuccess`, `onError`, `onCount`, etc.) and injectable utilities (`print`, `sleep`, `random`, `readLine`) for testability. Nodes always return `Next`. Termination is expressed in the walk wiring by passing `() => stop()` as the final edge.

**Walks** (`walks/`) wire nodes into concrete graphs and call `amble()`. The `nodes` record uses forward references resolved lazily via `node()`.

**Specs** (`specs/`) contain plain-language descriptions of walk behavior, used as design documents before implementation.

The pattern for adding a new walk: write a spec in `specs/`, implement nodes in `nodes/` with full dependency injection, compose them in `walks/`, and add tests alongside each node file.
