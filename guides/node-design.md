# Node design

How to decide what a node is before running `bun run ambler node`. The state, edges and utils types are the node's contract with its tests and with every walk that uses it. If they turn out wrong, change them and the tests first, then the body.

## Reuse first

Look in `specs/` and `nodes/` for a node that already does this. A node is reusable across walks because it only declares the state fields it uses. If a walk names a field differently, rename it in the walk; do not write an adapter node.

## One step

A node does one thing a spec can describe in a sentence or two. If the description needs "and then", it is probably two nodes with an edge between them.

## Edges

- One edge per distinct thing that can happen and that a walk might route differently: `onSuccess` and `onInvalidInput`, `onAgain` and `onFinished`.
- Name what happened, not where to go. `onFinished`, not `onGoToStop`. The node never names its successor.
- A node that ends the walk is terminal: its one edge is `onDone`.
- A problem the program handles as part of its flow (bad input, a missing file it can create) is an edge. A problem that stops the walk is thrown.
- A node that reads input routes end of input (`null`) somewhere other than its own retry edge, or it loops forever.

## Failures

- Throw an `Error` with a message that says what could not be done. Never swallow one with an empty `catch`.
- If the walk should report a handled failure, put it in an optional `error?: string` field and take an `onError` edge.

## State

- `State` lists only the fields the node reads or writes, with their types: `count: number`.
- Reuse the field name and type another node already gives it (`bun run ambler node … --state count`).
- Return a new object: `{ ...state, count: state.count + 1 }`.

## Utils

- Every side effect goes through `utils`: printing, reading input, time, randomness, files, network, processes. The factory itself stays pure and deterministic given its utils.
- One function per effect, in the terms of the domain: `sleep: (ms: number) => Promise<void>`, `readLine: (prompt: string) => string | null`.
- A failure the node must handle is in the return type; an unexpected one throws.
- `defaultUtils` implements each function in a line. If that needs a package, is shared with another node or is long, it belongs in `utils/` (`bun run ambler help util`).
- A node with no side effects keeps `Utils = Record<string, never>`.

## The body

- Return `[edges.onX, newState]` and nothing else: no ids of your own, nothing from `walks/`.
- A synchronous node returns the tuple; one that awaits a util is `async`.
