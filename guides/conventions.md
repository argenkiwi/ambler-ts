# Conventions

Every convention of a TypeScript Ambler project, with why it is there. `bun run ambler check` enforces the structural ones.

## Nodes

- A node is a factory, `NodeFactory<State, Edge, Utils>`. It returns the id its edge was wired to, never one it chose. Wiring is the walk's job, so a node can be reused in any walk.
- Edges are a union of `on…` string literals naming what happened: `onSuccess`, `onInvalidInput`. A terminal node has the one edge `onDone`.
- A node file exports `State`, `Edge`, `Utils` and `factory`. `defaultUtils` is not exported.
- Utils are the factory's second argument, defaulting to `defaultUtils`: the test passes its own object, no mocking library.
- State is never mutated: a node returns `{ ...state, field }`.
- A node declares in `State` only the fields it reads or writes. The walk's `State` must satisfy every node's, which `tsc` checks.
- An unexpected failure throws; `walk()` wraps it in a `WalkError` naming the node. An expected one is an edge.

## Walks

- `createWalk` passes `ambler()` one entry per `NodeId`, and each factory an edges record with every edge. `Record` types make both exhaustive: a forgotten node or edge is a type error.
- A walk module exports only `State`, `NodeId`, `WalkUtils` and `createWalk`.
- `WalkUtils` lets the wiring test replace every node's utils.
- Nodes are imported with `import defer`, so a walk only loads the nodes it reaches.

## Tests

- `nodes/tests/<node>.test.ts` and `walks/tests/<walk>.test.ts`, with `bun:test`.
- Nodes are built test-first.

## Files

- `nodes/<name>.ts`, `walks/<name>.ts`, `utils/<name>.ts`: kebab-case. Nothing is registered.
- `specs/<walk>.md` for every walk, the walk's name in snake_case.
- Each walk runs itself under `import.meta.main`, through a `package.json` script named after it.
- `ambler.ts` holds `NodeFactory`, `ambler()` and `walk()`. It is copied in, not a dependency, and is not edited.

## Project

- `tsc` runs in strict mode, and Biome's recommended rules and formatting are errors in `bun run ambler check`; `any` is an error.
- Imports name their `.ts` extension.
