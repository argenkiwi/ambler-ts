# Program Specifications

This program updates the title, body, and/or tags of an existing zettel, re-embedding it only when the body changes.

## Nodes

### Update
- Role — Sole node of the program.
- Logic — Applies whichever of `title`, `body`, `tags` were provided as a partial update to the zettel identified by `id`. Only re-embeds (and stores the new vector) when `body` was provided.
- Termination — On success, prints `{ id, updated: true }` and exits. If no zettel with that id exists, prints `{ error }` and exits.

## Shared State

- `id`: The zettel's unique id.
- `title`, `body`, `tags`: Optional partial fields to update.
- `result`: The update confirmation, once known.
- `error`: An error message, if the id was not found.
