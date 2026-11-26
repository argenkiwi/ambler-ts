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
- Usage: `node <name> (--outcomes <a,b> | --terminal) [--state <name:type>...]`.
- Writes `nodes/<name>.ts` and `nodes/tests/<name>.test.ts`; edges are derived from the outcomes (`onDone` when `--terminal`).
- Missing name or missing `--outcomes`/`--terminal`: prints an error, exit code 2, transitions to `onError`.
- Node already exists: prints an error, exit code 1, transitions to `onError`.
- Otherwise prints the created paths and transitions to `onDone`.

### ScaffoldWalk
- Usage: `walk <name> --nodes <n1,n2> [--edge <node.edge=target>...] [--no-runner]`.
- Writes `walks/<name>.ts` and `walks/tests/<name>.test.ts`, plus `specs/<name>.md` if it does not exist. The first node is the start node. `--no-runner` is accepted but currently has no effect.
- Missing name or `--nodes`: exit code 2, `onError`. Walk already exists: exit code 1, `onError`.
- Otherwise prints the created paths and transitions to `onDone`.

### ScaffoldUtil
- Usage: `util <name>`.
- Writes `utils/<name>.ts`.
- Missing name: exit code 2, `onError`. Util already exists: exit code 1, `onError`.
- Otherwise prints the created path and transitions to `onDone`.

### RunChecks
- Usage: `check [--lint-only]`.
- Runs `bun run check`, `bun run lint` and, unless `--lint-only`, `bun test nodes/tests walks/tests`, stopping at the first failure.
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
