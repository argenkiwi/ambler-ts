# bun run ambler walk

    bun run ambler walk <name> --nodes <start,next,...> [--edge <node>.<Outcome>=<node|halt>]... [--no-runner]

Wires existing nodes into `walks/<name>.ts`. Run it from the project root, after the nodes exist: it reads their edges, state and utils from `nodes/`. If a node is missing it lists the `bun run ambler node` commands to run first.

- `--nodes start,count,stop`: the nodes of the walk. The first is where it starts.
- `--edge start.success=count`: where an edge leads, by its outcome (`success`) or its name (`onSuccess`). Repeat it, or separate edges with commas. `=halt` wires the edge to `null`, which ends the walk.
- A node whose only edge is `onDone` ends the walk unless you give an edge for it.
- Edges you leave out become `unwired("NODE.onEdge")`: the walk type-checks, and throws when it reaches that node until you wire it.
- `--no-runner`: do not add a `package.json` script.

What it writes:

- `walks/<name>.ts`:
  - `State`, with the field of every `Has*` contract the nodes' `State`s extend, typed (and optional or not) as `nodes/state.ts` declares it; `type State = object` if there are none. It fails with exit code 2 if a node extends a contract `nodes/state.ts` lacks, or declares a field of its own.
  - `NodeId`, one id per node in capitals: `READ_MOVE`.
  - `WalkUtils`, an optional override of each node's utils, for tests.
  - `createWalk(utils)`, which wires each node's edges with `ambler()`. Nodes are imported with `import defer`, so each loads when first reached.
  - An `import.meta.main` block that runs the walk from an initial state.
- `walks/tests/<name>.test.ts`, with a `script()` to fill in and one test.
- `specs/<name>.md`, if there is none, with a section per node (`bun run ambler help spec`).
- A `<name>` script in `package.json`: run it with `bun run <name>`.

## Rules for a walk

- Export only `State`, `NodeId`, `WalkUtils` and `createWalk`.
- Every edge is wired in the edges record. No defaults, no casts: a new edge must fail to type-check until it is wired.
- Run it with `walk()` from `ambler.ts`. Do not write the loop yourself.
- The initial state is built in the `import.meta.main` block. If the program takes arguments, read `process.argv` there.
- If the walk can end in failure, exit 1 there: `if (final.error) process.exit(1);`.
- `State` is concrete and has exactly the fields of the contracts its nodes extend: a field no node uses does not belong in it. It does not extend the `Has*` contracts itself; `tsc` checks it satisfies each node's `State`.

## After generating

1. Wire the remaining `unwired(…)` edges, then delete `unwired`.
2. Finish `script()` and the wiring test, one test per path (`bun run ambler help testing`).
3. Fill in the spec.
4. Run it, then `bun run ambler check`.

Changing a walk later (adding a node, moving an edge) is an edit by hand: add the imports, the `NodeId`, the `WalkUtils` field, the entry and any field the node's contracts add to `State`; `tsc` points at each one you miss. Update the spec in the same change.
