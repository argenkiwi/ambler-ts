# bun run ambler node

    bun run ambler node <name> (--outcomes <a,b> | --terminal) [--state <field>[:<Type>]]...

Writes `nodes/<name>.ts` and its tests, `nodes/tests/<name>.test.ts`. Run it from the project root. Decide the flags with `bun run ambler help node-design` first: they are the node's contract.

- `<name>`: snake_case or kebab-case, no `-node` suffix. Files are kebab-case.
- `--outcomes success,invalid_input`: one edge per thing that can happen, named `onSuccess`, `onInvalidInput`. The walk wires each one to a successor.
- `--terminal`: the node ends the walk; its one edge is `onDone`, which the walk wires to `null`. Give exactly one of `--outcomes` and `--terminal`.
- `--state count:number`: the node's `State` has the field `count`. Fields are camelCase; repeat `--state` for more.
- `--state count`: the same field with the type another node already gives it.

There is no `--fallible`: a node that cannot go on throws, and the walk reports which node failed. A failure the program handles is an edge, `onError`.

What you get:

- `State`, the `Edge` union, an empty `Utils` with its `defaultUtils`, and `factory`, which throws `not yet implemented`.
- One test per edge in `nodes/tests/<name>.test.ts`. They fail with `not yet implemented`.

What is left to you, in this order:

1. Give `Utils` one function per side effect and implement each in `defaultUtils`.
2. Finish the tests: rename them, set up state and utils, assert the next id and the new state (`bun run ambler help testing`).
3. Run `bun test nodes/tests/<name>.test.ts` and see them fail with `not yet implemented`.
4. Implement the factory, using the utils it is given. Do not change the tests while doing so.
5. Replace the `TODO` doc comments.

It never overwrites: it fails if the node exists.
