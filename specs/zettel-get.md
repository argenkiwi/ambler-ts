# Program Specifications

This program fetches a single zettel by id, along with every link that touches it in either direction.

## Nodes

### Get
- Role — Sole node of the program.
- Logic — Looks up the zettel by `id`. If found, also fetches its links (both outgoing and incoming) and prints the combined record as JSON.
- Termination — On success, prints the zettel plus its `links` and exits. If no zettel with that id exists, prints `{ error }` and exits.

## Shared State

- `id`: The zettel's unique id.
- `result`: The fetched record plus its links, once known.
- `error`: An error message, if the id was not found.
