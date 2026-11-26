# Testing

Tests are `bun:test` files: `nodes/tests/<node>.test.ts` for nodes, `walks/tests/<walk>.test.ts` for walks.

## Nodes: test first

`bun run ambler node` writes a factory that throws `not yet implemented` and one failing test per edge.

1. Finish the tests before the body. One test per branch: each edge, and each distinct way of reaching it.
2. Run `bun test nodes/tests/<name>.test.ts`. Every test must fail with `not yet implemented`. A type error means the contract is wrong: fix the types, not the tests. A pass means the body does not throw.
3. Implement the factory until they pass. Do not edit the tests in this step.

Rules:

- Name tests after the node, the edge and the condition: `"count takes onStop when the coin says stop"`.
- Wire the edges to any ids, `{ onSuccess: "NEXT", onError: "ERROR" }`, or `null` for a terminal edge, and assert the id that comes back.
- Pass every util. Nothing in a node test touches the terminal, the clock, the network or the disk.
- Assert both halves of the result: the next id and the new state. Check the input state was not mutated.
- `await` the result: it works whether the node is synchronous or not.
- Use `toBeUndefined()` and `toBeNull()`, not `toEqual(undefined)`.

Utils:

- Fixed behaviour: a function returning a constant, `random: () => 0.6`.
- Async util: `sleep: async (_ms: number) => {}`.
- Recording what the node did: push to an array the test reads afterwards.

## Existing nodes without tests

Read the node, list its branches, and write the same kind of tests. They should pass at once; if one does not, the node has a bug or the test misreads it. Do not overwrite tests that already pass.

## Walks: test the wiring

`bun run ambler walk` writes a `script()` that returns the `WalkUtils` and one test.

- Make `script()` take the inputs to play back (arrays it shifts from) and return the utils of every node, plus arrays of what was printed or done.
- Run the walk with `walk(createWalk(utils), "<START>", state)` down one path.
- Assert the final state and what was recorded, in order.
- Cover every edge at least once across the tests. Node logic is already tested in the nodes; here you prove each edge leads where the spec says.
