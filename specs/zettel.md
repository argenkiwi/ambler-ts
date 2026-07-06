# Program Specifications

This program is the unified entry point for the Zettelkasten knowledge store, handling all CRUD and search sub-operations.

## Nodes

### Route
- Role — Initial node of the program.
- Logic — Reads the `action` field from the state (the subcommand). Transitions to the node matching the subcommand (case-insensitive).
- Edges — 
  - If action is "search", transitions to `SEARCH`.
  - If action is "create", transitions to `CREATE`.
  - If action is "get", transitions to `GET`.
  - If action is "update", transitions to `UPDATE`.
  - If action is "delete", transitions to `DELETE`.
  - If action is "link", transitions to `LINK`.
  - If action is invalid or missing, sets an error and transitions to `ERROR` (null).

### Search
- Role — Search node.
- Logic — Performs keyword full-text search and optional semantic similarity ranking for `query`, returning up to `limit` matches.
- Termination — Prints results to stdout and terminates.

### Create
- Role — Creation node.
- Logic — Generates a unique ID and optional embedding for a new zettel with `title`, `body`, and `tags`, saves it, and establishes any specified `links`.
- Termination — Prints the created record to stdout and terminates.

### Get
- Role — Retrieval node.
- Logic — Fetches a zettel record and all its associated links by `id`.
- Termination — Prints the record or returns `onNotFound` and terminates.

### Update
- Role — Update node.
- Logic — Updates the specified `title`, `body` (with re-embedding), and `tags` of an existing zettel by `id`.
- Termination — Prints the update result or returns `onNotFound` and terminates.

### Delete
- Role — Deletion node.
- Logic — Removes a zettel record by `id`.
- Termination — Prints the deletion result or returns `onNotFound` and terminates.

### Link
- Role — Linking node.
- Logic — Creates a link between two existing zettels (`fromId` and `toId`) with a short `relation` phrase.
- Termination — Prints the linkage result or returns `onError` and terminates.

## Shared State

The shared state represents the union of parameters needed across all operations:
- `action`: The subcommand to run (`"search" | "create" | "get" | "update" | "delete" | "link"`).
- `id`: The target zettel identifier (used by get, update, delete).
- `query`: The search text (used by search).
- `limit`: Optional maximum search results (used by search).
- `title`: The zettel title (used by create, update).
- `body`: The zettel body content (used by create, update).
- `tags`: The zettel tags (used by create, update).
- `links`: Optional list of links to create (used by create).
- `fromId`: The source zettel ID for a link (used by link).
- `toId`: The destination zettel ID for a link (used by link).
- `relation`: The connection phrase for a link (used by link).
- `results`: List of search matches (used by search).
- `result`: The operation output data (used by create, get, update, delete, link).
- `error`: Error message if any operation fails.
