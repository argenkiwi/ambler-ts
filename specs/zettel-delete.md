# Program Specifications

This program permanently removes a zettel, its search index entry, and any links referencing it.

## Nodes

### Delete
- Role — Sole node of the program.
- Logic — Deletes the zettel identified by `id` from storage, along with its full-text index entry and every link where it is either the source or the target.
- Termination — On success, prints `{ id, deleted: true }` and exits. If no zettel with that id exists, prints `{ error }` and exits.

## Shared State

- `id`: The zettel's unique id.
- `result`: The deletion confirmation, once known.
- `error`: An error message, if the id was not found.
