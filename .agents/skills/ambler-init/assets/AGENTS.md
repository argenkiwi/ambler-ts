# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run tests
deno test

# Run a single test file
deno test nodes/<name>Node.test.ts

# Run a walk directly
deno run walks/<name>.ts
```

## Architecture

**Ambler** is a Deno/TypeScript state machine framework. The core execution model lives in `ambler.ts`:

- `Node<S, K>` — a function `(state: S) => MaybePromise<NodeResult<S, K>>` representing a node in the graph
- `ambler(nodes)` — factory that returns an async function to start the machine
- `next(nodeId, state)` — helper to create a `NodeResult` transitioning to the next node
- `stop(state)` — helper to create a terminal `NodeResult`

**Nodes** (`nodes/`) implement individual steps. Each node is created via a factory that accepts typed transition identifiers (`onSuccess`, `onError`, etc.) and injectable utilities for testability. Nodes return a `NodeResult` via the `next()` or `stop()` helpers.

**Walks** (`walks/`) wire nodes into a registry and call `ambler()`.

**Specs** (`specs/`) contain plain-language descriptions of walk behavior, used as design documents before implementation.

**Utilities** (`utils/`) contain reusable logic and helpers.

The pattern for adding a new walk: write a spec in `specs/`, implement nodes in `nodes/` with full dependency injection, compose them in `walks/`, and add tests alongside each node file.
