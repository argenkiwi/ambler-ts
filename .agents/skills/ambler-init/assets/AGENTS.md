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

- `Next<S, K>` — a tuple `[key: K | null, state: S]` returned by each node; `null` key terminates the machine
- `Node<S, K>` — a function `(state: S, key: K) => MaybePromise<Next<S, K>>` representing a node in the graph
- `ambler(nodes)` — single-step executor factory; given a nodeId and state, invokes that node and returns its `Next` tuple
- `amble(nodes, initialNodeId, initialState)` — full execution loop; drives the machine until a node returns `null`

**Nodes** (`nodes/`) implement individual steps. Each node is created via a factory that accepts typed transition identifiers (`onSuccess`, `onError`, etc.) and injectable utilities for testability. Nodes return a `Next` tuple: `[edges.onEdgeName, newState]` to transition, or `[null, state]` to terminate.

**Walks** (`walks/`) wire nodes into a registry and call `amble()`.

**Specs** (`specs/`) contain plain-language descriptions of walk behavior, used as design documents before implementation.

**Utilities** (`utils/`) contain reusable logic and helpers.

The pattern for adding a new walk: write a spec in `specs/`, implement nodes in `nodes/` with full dependency injection, compose them in `walks/`, and add tests alongside each node file.
