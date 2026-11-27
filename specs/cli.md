# CLI Specification

The native Ambler Tooling Protocol (ATP) command-line tool, run as `bun cli.ts <command> [options]`. It scaffolds nodes, walks and utils, and runs the project checks. The root `cli.ts` is a thin shim that runs this walk and exits with the final `exitCode`.

## Nodes

### CliRoute
- Initial node of the application.
- Takes the first entry of `argv` as the command and removes it from `argv`.
- `node` transitions to `SCAFFOLD_NODE`, `walk` to `SCAFFOLD_WALK`, `util` to `SCAFFOLD_UTIL`, `check` to `RUN_CHECKS`.
- `help`, `--help` or `-h` transitions to `CLI_HELP` (exit code 0), leaving any topic in `argv`.
- No command transitions to `CLI_HELP` with exit code 2.
- Any other command transitions to `CLI_ERROR`.

### ScaffoldNode
- Usage: `node <name> (--outcomes <a,b> | --terminal) [--state <field>[:<Type>]]...`.
- Writes `nodes/<name>.ts` and `nodes/tests/<name>.test.ts`; edges are derived from the outcomes (`onDone` when `--terminal`).
- Each `--state` field resolves to its `Has<Field>` contract in the registry `nodes/state.ts`. The node's `State` extends those contracts, or is `type State = object` without any. `field:Type` with no contract yet appends one to the registry, creating the file if needed.
- Missing name or missing `--outcomes`/`--terminal`: prints an error, exit code 2, transitions to `onError`.
- A bare `--state field` the registry has no contract for, or a `field:Type` whose type differs from the registry's: prints an error, exit code 2, transitions to `onError`, writing nothing.
- Node already exists: prints an error, exit code 1, transitions to `onError`.
- Otherwise prints the created paths and transitions to `onDone`.

### ScaffoldWalk
- Usage: `walk <name> --nodes <n1,n2> [--edge <node.edge=target>...] [--no-runner]`.
- Writes `walks/<name>.ts` and `walks/tests/<name>.test.ts`, plus `specs/<name>.md` if it does not exist. The first node is the start node. `--no-runner` is accepted but currently has no effect.
- The walk's `State` has the field of each `Has*` contract the nodes' `State`s extend, as `nodes/state.ts` declares it.
- Missing name or `--nodes`, a node extending a contract `nodes/state.ts` lacks, or a node declaring `State` fields of its own: exit code 2, `onError`. Walk already exists: exit code 1, `onError`.
- Otherwise prints the created paths and transitions to `onDone`.

### ScaffoldUtil
- Usage: `util <name>`.
- Writes `utils/<name>.ts`.
- Missing name: exit code 2, `onError`. Util already exists: exit code 1, `onError`.
- Otherwise prints the created path and transitions to `onDone`.

### RunChecks
- Usage: `check [--lint-only]`.
- First checks the conventions of the project's `nodes/`, `walks/` and `utils/` folders, tests included, printing one line per violation as `<path>:<line>: <rule>: <what to do>`. The rules so far are `todo`: no placeholder the scaffolders write is left, that is no `throw new Error("not yet implemented")`, no `.toThrow("not yet implemented")` and no `unwired("NODE.onEdge")` call; and `state-contracts`: `Has*` interfaces are declared only in `nodes/state.ts`, each with exactly one field named after it, and every node in `nodes/` exports a `State` that only extends `Has*` contracts, or is `type State = object`. If there are violations, it prints how many, sets exit code 1 and transitions to `onError`, with or without `--lint-only`.
- Then runs `bun run check`, `bun run lint` and, unless `--lint-only`, `bun test nodes/tests walks/tests`, stopping at the first failure.
- On failure prints the failed step, sets the exit code to the step's exit code (1 if unknown) and transitions to `onError`.
- If all pass, prints a success message and transitions to `onDone`.

### CliHelp
- Usage: `help [topic]`.
- For `help`, prints the guide for the topic in `argv`, or the general guide if there is none, and transitions to `onDone`. An unknown topic prints the known topics on standard error and sets exit code 1.
- For `--help`, `-h` or no command, prints the usage text and transitions to `onDone`, keeping the exit code.

### CliError
- Prints `Unknown command: <command>`, sets exit code 2 and transitions to `onDone`.

## Shared State

The shared state consists of:
- `argv`: the command-line arguments; the command is consumed by `CliRoute`, leaving the options for the handler.
- `command`: the command name consumed by `CliRoute` (used for the unknown-command message).
- `exitCode`: the process exit code (starts at 0).
