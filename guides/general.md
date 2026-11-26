# bun run ambler

Scaffolds and checks a TypeScript Ambler project (on Bun): a program built as walks (state machines) of small, tested nodes. It is the project's own CLI, a dev dependency, so it needs nothing installed beyond `bun install`.

    bun run ambler node <name> …                  add a node: its contract, a throwing body, failing tests
    bun run ambler util <name>                    add a module of side-effectful functions
    bun run ambler walk <name> --nodes … --edge … wire nodes into a walk, with its test, spec and script
    bun run ambler check [--lint-only]            verify the conventions, then tsc, biome and tests
    bun run ambler help [topic]                   this guide, or one topic

Topics: a verb (node, util, walk, check), or conventions, node-design, testing, spec.

Exit codes: 0 success, 1 a check failed or the thing to create already exists, 2 invalid arguments or an unexpected error.

Where the `ambler` command is installed, `ambler <verb>` runs the same thing. It also creates projects (`ambler new`) and implements a spec with an agent loop (`ambler pave`); neither is needed to work inside a project.

## The four ideas

- State: one object per walk. Each node declares only the fields it uses in its own `State`; the walk's `State` has them all.
- Node: one step. A factory takes the edges and utils and returns a function from state to `[next, newState]`. It returns the id its edge was wired to, never a node it chose.
- Utils: a node's side effects, one function each, in its `Utils` type. `defaultUtils` is the real thing; tests pass their own.
- Walk: wires each node's edges to the next node in `createWalk`. The edges record is typed, so an unwired edge does not compile.

## Layout

    ambler.ts       NodeFactory, ambler(), walk(), WalkError (identical in every project)
    walks/          one file per walk; each runs itself under `bun walks/<walk>.ts`
    walks/tests/    one wiring test per walk
    nodes/          one file per node
    nodes/tests/    one test file per node
    utils/          side-effectful functions nodes delegate to
    specs/          one plain-language spec per walk

## Usual order of work

1. Describe the walk in `specs/<walk>.md` (`bun run ambler help spec`).
2. For each node: `bun run ambler node`, then tests, then the body (`bun run ambler help node-design`, `bun run ambler help testing`).
3. `bun run ambler walk` to wire them; finish the wiring test (`bun run ambler help walk`).
4. `bun run ambler check`.

Run `bun install` once in a new project, so this CLI, the checks and the formatter are there.
