# Program Specifications

This program clones an existing Ambler artifact — a walk, a node, or a utility — to another directory. It copies the source file along with all its dependencies. If the target directory is not an Ambler project, it initializes it first. After copying, it updates the target's `deno.json` with a deno task (for walks) and any external npm/jsr dependencies (for utilities).

## Nodes

### Setup
- Initial node of the application.
- Validates that the source path exists and that a target directory is provided.
- Detects the artifact type from the source path's parent directory: `walks/` → `walk`, `nodes/` → `node`, `utils/` → `util`.
- Checks if the target directory is an existing Ambler project (containing `ambler.ts` and `deno.json`).
- If valid and the target is an existing project, transitions to `ANALYZE`.
- If valid and the target is a new project, transitions to `INIT_SETUP`.
- If invalid or missing arguments, transitions to `STOP` with an error.

### Analyze
- Scans the source artifact to identify all files that need to be copied, depending on artifact type:
  - **walk**: the walk file (`walks/<name>.ts`), its spec (`specs/<name>.md`), all referenced nodes (`nodes/*.ts`), and all referenced utilities (`utils/*.ts`), including utilities imported by nodes.
  - **node**: the node file (`nodes/<name>.ts`) and any utilities it imports.
  - **util**: only the utility file (`utils/<name>.ts`).
- Reads the source `deno.json` import map and scans all collected utility files for bare specifiers (e.g. `"ollama"`, `"@std/assert"`) that are present in that map. Records them as `externalDeps`.
- Transitions to `COPY` on success, or `STOP` on error.

### Init Setup
- Creates the standard Ambler directory structure in the target directory (`walks/`, `specs/`, `utils/`, `nodes/tests/`).
- Transitions to `INIT_COPY` on success, or `STOP` on error.

### Init Copy
- Copies the `ambler.ts` engine file into the target directory.
- Transitions to `INIT_CONFIG` on success, or `STOP` on error.

### Init Config
- Writes a base `deno.json` with a minimal import map to the target directory.
- Transitions to `ANALYZE` on success, or `STOP` on error.

### Copy
- Copies all identified files from the source root to the target directory, preserving the directory structure.
- Transitions to `CONFIG` on success, or `STOP` on error.

### Config
- Updates the target's `deno.json`:
  - If the artifact type is `walk`: adds a task entry for the walk. Copies the task command from the source `deno.json` if present; otherwise generates `deno run --allow-read --allow-write walks/<name>.ts`.
  - If `externalDeps` is non-empty: merges the external import map entries into the target's `deno.json` imports.
- Skips writing if nothing needs to be added.
- Transitions to `STOP` on success or error.

### Stop
- Displays the result of the operation (success or error), including the artifact type and name, and terminates.

## Shared State

The shared state consists of:
- `sourceWalkPath`: The path to the source artifact (walk, node, or utility file).
- `targetDir`: The destination directory path.
- `sourceRoot`: The root directory of the source project (derived from the source path).
- `walkName`: The filename (without `.ts`) of the source artifact.
- `artifactType`: The kind of artifact being cloned — `"walk"`, `"node"`, or `"util"`.
- `filesToCopy`: A list of relative file paths to be copied.
- `externalDeps`: A map of bare specifier to versioned URL for external dependencies found in cloned utilities.
- `isNewProject`: A boolean flag indicating if the target directory needs initialization.
- `error`: An optional error message if any step fails.
