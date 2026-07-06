# Program Specifications

This program creates a new zettel (an atomic knowledge note) in the project's Zettelkasten, storing it in SQLite with an optional semantic embedding, and links it to any related notes the caller already identified.

## Nodes

### Create
- Role — Sole node of the program.
- Logic — Reads `title`, `body`, `tags`, and an optional list of `links` (each an existing zettel id plus a short relation phrase) from the input. Generates a unique timestamp-based id, attempts to embed the body (skipped silently if no embeddings host is reachable), stores the zettel, and creates each provided link. Prints the created zettel as JSON to stdout.
- Termination — On success, prints `{ id, title, tags, created, links }` and exits. On failure (e.g. a storage error), prints `{ error }` and exits.

## Shared State

- `title`: The zettel's title.
- `body`: The zettel's full note text — the single idea it captures.
- `tags`: A list of tags for coarse categorization.
- `links`: An optional list of `{ toId, relation }` pairs connecting this new zettel to existing ones.
- `result`: The created record, once known.
- `error`: An error message, if creation failed.
