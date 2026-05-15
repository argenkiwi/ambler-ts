# Program Specifications

This program bootstraps a new Ambler project by creating the necessary directory structure and copying essential files.

## Nodes

### Setup
- Initial node.
- Validates the `targetDir` from the state. If it's missing or invalid (exists but is not a directory), it transitions to `STOP` with an error.
- Creates the project directories: `walks`, `specs`, `utils`, and `nodes/tests`.
- If successful, transitions to `COPY`. If an error occurs during directory creation, transitions to `STOP` with an error.

### Copy
- Copies the `ambler.ts` source file to the `targetDir`.
- If successful, transitions to `CONFIG`.
- If copying fails, transitions to `STOP` with an error.

### Config
- Writes the `deno.json` configuration file to the `targetDir`.
- If successful, transitions to `STOP`.
- If writing fails, transitions to `STOP` with an error.

### Stop
- Termination node.
- If the state contains an error, it displays the error message and exits with a failure code.
- If no error, it displays a success message and instructions for the user.

## Shared State

The shared state consists of:
- `targetDir`: The string path of the directory to initialize.
- `error`: An optional string containing an error message if any step fails.
