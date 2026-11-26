# bun run ambler util

    bun run ambler util <name>

Writes `utils/<name>.ts`. Run it from the project root. Nothing is registered: nodes import it by path.

## When to extract

Move a `defaultUtils` function into `utils/` when it needs an npm package, is used by more than one node, or is too long to read at a glance. One-liners such as `console.log` stay in `defaultUtils`.

## Rules for a utility module

- Export plain functions only. No classes to construct.
- State (a client, a cache) lives in a private module-level `const`.
- Give each function exactly the signature the node's `Utils` field has, so `defaultUtils` can name it directly.
- A failure the node must handle is in the return type; an unexpected one throws.
- Import nothing from `../ambler.ts`, `../nodes/` or `../walks/`. Utilities know nothing of nodes.
- URLs, paths and other fixed values are named `const`s at the top of the file.
- Document every exported function with TSDoc: `@param`, `@returns`.
- Use portable APIs (`node:fs/promises`, `process`) rather than `Bun.*`, so nodes stay testable.

## Packages

Add what the module needs with `bun add <package>`.

## Connecting it to a node

    import { append } from "../utils/journal.ts";

    export type Utils = {
      log: (entry: string) => Promise<void>;
    };

    const defaultUtils: Utils = { log: append };

The node's tests do not change: they pass their own `Utils` and never reach the utility.
