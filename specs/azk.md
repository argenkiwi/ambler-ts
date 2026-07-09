# Program Specifications

This program is the unified entry point for the Zettelkasten knowledge store, handling all CRUD, search, and index-maintenance sub-operations. Notes persist as Markdown files with YAML frontmatter under `notes/<id>.md` (the source of truth); `.zettelkasten/note.db` is a derived SQLite index (FTS5 + optional embeddings + link graph) kept in sync by the Create/Update/Delete/Link nodes and fully rebuildable via Reindex.

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
  - If action is "reindex", transitions to `REINDEX`.
  - If action is invalid or missing, sets an error and transitions to `ERROR` (null).

### Search
- Role — Search node.
- Logic — Performs keyword full-text search and optional semantic similarity ranking for `query`, returning up to `limit` matches.
- Termination — Prints results to stdout and terminates.

### Create
- Role — Creation node.
- Logic — Generates a unique ID and optional embedding for a new note with `title`, `body`, and `tags`, saves it, and establishes any specified `links`.
- Termination — Prints the created record to stdout and terminates.

### Get
- Role — Retrieval node.
- Logic — Fetches a note record and all its associated links by `id`.
- Termination — Prints the record or returns `onNotFound` and terminates.

### Update
- Role — Update node.
- Logic — Updates the specified `title`, `body` (with re-embedding), and `tags` of an existing note by `id`.
- Termination — Prints the update result or returns `onNotFound` and terminates.

### Delete
- Role — Deletion node.
- Logic — Removes a note record by `id`.
- Termination — Prints the deletion result or returns `onNotFound` and terminates.

### Link
- Role — Linking node.
- Logic — Creates a link between two existing notes (`fromId` and `toId`) with a short `relation` phrase, appending it to the source note's frontmatter and mirroring it into the index.
- Termination — Prints the linkage result or returns `onError` and terminates.

### Reindex
- Role — Index-maintenance node.
- Logic — Walks every `notes/*.md` file, upserts changed notes into the SQLite index (re-embedding only when a note's body hash changed), rebuilds the link graph from each note's frontmatter, and removes index entries whose file no longer exists.
- Termination — Prints `{ indexed, updated, removed, total }` and terminates.

## Shared State

The shared state represents the union of parameters needed across all operations:
- `action`: The subcommand to run (`"search" | "create" | "get" | "update" | "delete" | "link"`).
- `id`: The target note identifier (used by get, update, delete).
- `query`: The search text (used by search).
- `limit`: Optional maximum search results (used by search).
- `title`: The note title (used by create, update).
- `body`: The note body content (used by create, update).
- `tags`: The note tags (used by create, update).
- `links`: Optional list of links to create (used by create).
- `fromId`: The source note ID for a link (used by link).
- `toId`: The destination note ID for a link (used by link).
- `relation`: The connection phrase for a link (used by link).
- `results`: List of search matches (used by search).
- `result`: The operation output data (used by create, get, update, delete, link).
- `error`: Error message if any operation fails.
