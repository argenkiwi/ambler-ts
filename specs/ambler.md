# Program Specifications

This program is the unified entry point for project scaffolding, handling both the `init` and `clone` sub-operations. `init` bootstraps a new Ambler project by creating the necessary directory structure and copying essential files. `clone` copies an existing Ambler artifact — a walk, a node, or a utility — into another directory, initializing it first if it isn't yet an Ambler project.

## Nodes

### Route
- Role — Initial node of the program.
- Logic — Reads the `action` field from the state (the subcommand). Transitions to the node matching the subcommand (case-insensitive).
- Edges —
  - If action is "init", transitions to `INIT_SETUP`.
  - If action is "clone", transitions to `CLONE_SETUP`.
  - If action is invalid or missing, sets an error and transitions to `ERROR` (null).

### Init Setup
- Validates the `targetDir` from the state. If it's missing or invalid (exists but is not a directory), it transitions to `INIT_STOP` with an error.
- Creates the project directories: `walks`, `specs`, `utils`, and `nodes/tests`.
- If successful, transitions to `INIT_COPY`. If an error occurs during directory creation, transitions to `INIT_STOP` with an error.

### Init Copy
- Copies the `ambler.ts` source file to the `targetDir`.
- If successful, transitions to `INIT_CONFIG`.
- If copying fails, transitions to `INIT_STOP` with an error.

### Init Config
- Writes the `deno.json` configuration file to the `targetDir`.
- If successful, transitions to `INIT_STOP`.
- If writing fails, transitions to `INIT_STOP` with an error.

### Init Stop
- Termination node for the `init` action.
- If the state contains an error, it displays the error message and exits with a failure code.
- If no error, it displays a success message and instructions for the user.

### Clone Setup
- Initial node of the `clone` action.
- Validates that the source path exists and that a target directory is provided.
- Detects the artifact type from the source path's parent directory: `walks/` → `walk`, `nodes/` → `node`, `utils/` → `util`.
- Checks if the target directory is an existing Ambler project (containing `ambler.ts` and `deno.json`).
- If valid and the target is an existing project, transitions to `CLONE_ANALYZE`.
- If valid and the target is a new project, transitions to `CLONE_INIT_SETUP`.
- If invalid or missing arguments, transitions to `CLONE_STOP` with an error.

### Clone Analyze
- Scans the source artifact to identify all files that need to be copied, depending on artifact type:
  - **walk**: the walk file (`walks/<name>.ts`), its spec (`specs/<name>.md`), all referenced nodes (`nodes/*.ts`), and all referenced utilities (`utils/*.ts`), including utilities imported by nodes.
  - **node**: the node file (`nodes/<name>.ts`) and any utilities it imports.
  - **util**: only the utility file (`utils/<name>.ts`).
- Reads the source `deno.json` import map and scans all collected utility files for bare specifiers (e.g. `"ollama"`, `"@std/assert"`) that are present in that map. Records them as `externalDeps`.
- Transitions to `CLONE_COPY` on success, or `CLONE_STOP` on error.

### Clone Init Setup
- Creates the standard Ambler directory structure in the target directory (`walks/`, `specs/`, `utils/`, `nodes/tests/`), reusing the same node as `INIT_SETUP`.
- Transitions to `CLONE_INIT_COPY` on success, or `CLONE_STOP` on error.

### Clone Init Copy
- Copies the `ambler.ts` engine file into the target directory, reusing the same node as `INIT_COPY`.
- Transitions to `CLONE_INIT_CONFIG` on success, or `CLONE_STOP` on error.

### Clone Init Config
- Writes a base `deno.json` with a minimal import map to the target directory, reusing the same node as `INIT_CONFIG`.
- Transitions to `CLONE_ANALYZE` on success, or `CLONE_STOP` on error.

### Clone Copy
- Copies all identified files from the source root to the target directory, preserving the directory structure.
- Transitions to `CLONE_CONFIG` on success, or `CLONE_STOP` on error.

### Clone Config
- Updates the target's `deno.json`:
  - If the artifact type is `walk`: adds a task entry for the walk. Copies the task command from the source `deno.json` if present; otherwise generates `deno run --allow-read --allow-write walks/<name>.ts`.
  - If `externalDeps` is non-empty: merges the external import map entries into the target's `deno.json` imports.
- Skips writing if nothing needs to be added.
- Transitions to `CLONE_STOP` on success or error.

### Clone Stop
- Termination node for the `clone` action.
- Displays the result of the operation (success or error), including the artifact type and name, and terminates.

## Shared State

The shared state represents the union of parameters needed across both operations:
- `action`: The subcommand to run (`"init" | "clone"`).
- `targetDir`: The destination directory path (used by init and clone).
- `sourceWalkPath`: The path to the source artifact — walk, node, or utility file (used by clone).
- `sourceRoot`: The root directory of the source project, derived from the source path (used by clone).
- `walkName`: The filename (without `.ts`) of the source artifact (used by clone).
- `artifactType`: The kind of artifact being cloned — `"walk"`, `"node"`, or `"util"` (used by clone).
- `filesToCopy`: A list of relative file paths to be copied (used by clone).
- `externalDeps`: A map of bare specifier to versioned URL for external dependencies found in cloned utilities (used by clone).
- `isNewProject`: A boolean flag indicating if the target directory needs initialization (used by clone).
- `error`: An optional error message if any step fails.
