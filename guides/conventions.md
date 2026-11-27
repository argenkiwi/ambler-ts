# Conventions

Every convention of a TypeScript Ambler project, with why it is there. `bun run ambler check` enforces the structural ones.

## Nodes

- A node is a factory, `NodeFactory<State, Edge, Utils>`. It returns the id its edge was wired to, never one it chose. Wiring is the walk's job, so a node can be reused in any walk.
- Edges are a union of `on…` string literals naming what happened: `onSuccess`, `onInvalidInput`. A terminal node has the one edge `onDone`.
- A node file exports `State`, `Edge`, `Utils` and `factory`. `defaultUtils` is not exported.
- Utils are the factory's second argument, defaulting to `defaultUtils`: the test passes its own object, no mocking library.
- State is never mutated: a node returns `{ ...state, field }`.
- Every state field has one contract in the state registry, `nodes/state.ts`: `export interface HasCount { count: number; }`, named `Has` and the field in PascalCase, with exactly one field. Nothing else declares `Has*` types. One contract per field means one type per field across the project, and the scaffolders read it from one place.
- A node composes the contracts of the fields it reads or writes, and declares none of its own: `export interface State extends HasCount, HasBoard {}`, imported with `import type { … } from "./state.ts"`. A node that needs no state exports `type State = object;`. Every node exports `State`.
- The walk's `State` is concrete: it has every field its nodes' contracts give and no other, and `tsc` checks it satisfies each node's.
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

- `nodes/<name>.ts`, `walks/<name>.ts`, `utils/<name>.ts`: kebab-case. Nodes, walks and utilities are not registered; only state contracts are, in `nodes/state.ts`.
- `specs/<walk>.md` for every walk, the walk's name in snake_case.
- Each walk runs itself under `import.meta.main`, through a `package.json` script named after it.
- `ambler.ts` holds `NodeFactory`, `ambler()` and `walk()`. It is copied in, not a dependency, and is not edited.

## Project

- `tsc` runs in strict mode, and Biome's recommended rules and formatting are errors in `bun run ambler check`; `any` is an error.
- Imports name their `.ts` extension.
