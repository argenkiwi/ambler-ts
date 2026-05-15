# Program Specifications

This program clones an existing Ambler walk to another directory. It ensures that the walk file, its specification, and all its referenced nodes and utilities are copied. If the target directory is not an Ambler project, it initializes it first.

## Nodes

### Setup
- Initial node of the application.
- Validates that the source walk exists in the current project and that a target directory is provided.
- Checks if the target directory is an existing Ambler project (containing `ambler.ts` and `deno.json`).
- If valid, transitions to `ANALYZE`.
- If invalid or missing arguments, transitions to `STOP` with an error.

### Analyze
- Scans the source walk file (`walks/<name>.ts`) to identify all imported nodes and utilities.
- Builds a list of all files that need to be copied:
  - The walk file: `walks/<name>.ts`
  - The specification file: `specs/<name>.md`
  - All referenced nodes: `nodes/<nodeName>.ts`
  - All referenced utilities: `utils/<utilName>.ts`
- Transitions to `INIT` if the target directory needs initialization, otherwise transitions to `COPY`.

### Init
- Initializes the target directory as an Ambler project.
- Copies core files like `ambler.ts`, `deno.json`, and creates the standard directory structure.
- Transitions to `COPY`.

### Copy
- Copies all identified files from the current project to the target directory, preserving the directory structure.
- Transitions to `STOP`.

### Stop
- Displays the result of the operation (success or error) and terminates.

## Shared State

The shared state consists of:
- `sourceWalk`: The name of the walk to be cloned.
- `targetDir`: The destination directory path.
- `filesToCopy`: A list of relative file paths to be copied.
- `isNewProject`: A boolean flag indicating if the target directory needs initialization.
- `error`: An optional error message if any step fails.
