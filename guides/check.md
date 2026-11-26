# bun run ambler check

    bun run ambler check [--lint-only]

Run it from the project root when the work is done. It checks the structural conventions and prints one line per violation:

    <path>:<line>: <rule>: <what to do>

If there are none, it runs `bun run check` (`tsc`), `bun run lint` (Biome) and `bun run test`, stopping at the first that fails. `--lint-only` skips the tests. It exits 1 if anything failed. Run `bun install` first.

## Rules

- `layout`: `package.json` and `ambler.ts` exist.
- `parse`: the file is valid TypeScript.
- `todo`: no `not yet implemented` or `unwired(…)` is left in a node, walk, utility or test.
- `file-name`: node, walk and utility files are kebab-case.
- `node-shape`: a node exports `factory`, `State`, `Utils` and an `Edge` union of `on…` names.
- `node-tests`: a node has `nodes/tests/<node>.test.ts`.
- `orphan-test`: a test file's node or walk exists.
- `walk-surface`: a walk exports only `State`, `NodeId`, `WalkUtils` and `createWalk`.
- `walk-tests`: a walk has `walks/tests/<walk>.test.ts`.
- `walk-runner`: a `package.json` script runs the walk.
- `walk-spec`: the walk has `specs/<walk>.md`, its name in snake_case.
- `spec-nodes`: the spec's `###` headings are exactly the walk's `NodeId`s.
- `spec-sections`: a spec has `# Program Specifications`, `## Nodes` and `## Shared State`, and no other sections.
- `util-imports`: a utility imports nothing from `../ambler.ts`, `../nodes/` or `../walks/`.

What it cannot check is yours: that edges name what happened, that tests cover every branch, that the spec's prose matches the code. See `bun run ambler help node-design`, `bun run ambler help testing` and `bun run ambler help spec`.
