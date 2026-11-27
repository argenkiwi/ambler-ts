# bun run ambler node

    bun run ambler node <name> (--outcomes <a,b> | --terminal) [--state <field>[:<Type>]]...

Writes `nodes/<name>.ts` and its tests, `nodes/tests/<name>.test.ts`. Run it from the project root. Decide the flags with `bun run ambler help node-design` first: they are the node's contract.

- `<name>`: snake_case or kebab-case, no `-node` suffix. Files are kebab-case.
- `--outcomes success,invalid_input`: one edge per thing that can happen, named `onSuccess`, `onInvalidInput`. The walk wires each one to a successor.
- `--terminal`: the node ends the walk; its one edge is `onDone`, which the walk wires to `null`. Give exactly one of `--outcomes` and `--terminal`.
- `--state count:number`: the node's `State` extends `HasCount`, the contract for the field `count` in `nodes/state.ts`. If there is no `HasCount` yet, it is added there (and `nodes/state.ts` created); if there is one with another type, it fails with exit code 2. Fields are camelCase; repeat `--state` for more.
- `--state count`: reuse the `HasCount` already in `nodes/state.ts`. It fails with exit code 2 if there is none: give the type.
- No `--state`: `type State = object;`.

There is no `--fallible`: a node that cannot go on throws, and the walk reports which node failed. A failure the program handles is an edge, `onError`.

What you get:

- `State`, extending the `Has*` contracts it imports from `./state.ts`; the `Edge` union; a `Utils` with its `defaultUtils`; and `factory`, which throws `not yet implemented`.
- Any new contract appended to `nodes/state.ts`, with an `import type` for each type it names that a file in `nodes/` or `utils/` exports.
- One test per edge in `nodes/tests/<name>.test.ts`. They fail with `not yet implemented`.

What is left to you, in this order:

1. Give `Utils` one function per side effect and implement each in `defaultUtils`.
2. Finish the tests: rename them, set up state and utils, assert the next id and the new state (`bun run ambler help testing`).
3. Run `bun test nodes/tests/<name>.test.ts` and see them fail with `not yet implemented`.
4. Implement the factory, using the utils it is given. Do not change the tests while doing so.
5. Replace the `TODO` doc comments.

It never overwrites: it fails if the node exists.
