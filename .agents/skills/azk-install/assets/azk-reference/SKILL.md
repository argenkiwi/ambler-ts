---
name: azk-reference
description: On-demand reference for the globally-installed `azk` CLI — exact JSON output shapes and non-obvious gotchas per subcommand (search, create, get, update, delete, link, reindex) that aren't covered by the binary's own usage/error output. Use this once `azk-install` has already installed `azk` globally, whenever you're about to run a CRUD operation and need to know the response shape or an edge case (e.g. what happens on empty stdin, what partial update returns, what delete cascades to). For installing `azk` globally in the first place, use azk-install instead.
metadata:
  author: leandro
  version: "1.0"
---

# Azk Reference

Syntax for all 7 subcommands is self-documented: run `azk` with no arguments for the full list, or run any subcommand with missing/invalid args for its own `Usage: ...` string. This reference covers only what that runtime output doesn't: exact JSON shapes and gotchas.

### search
`azk search "<query>" [limit]` — `limit` defaults to 5.
Returns `{ id, title, tags, created, score }[]`, best-first, or `[]`. Degrades to keyword-only (FTS5) if no embeddings host is reachable.

### create
`echo '{"title":"...","body":"...","tags":[...],"links":[{"toId":"...","relation":"..."}]}' | azk create`
Returns `{ id, title, tags, created, links }`, or `{ error }`.
Gotcha: stdin must be valid, non-empty JSON — empty or malformed input throws an uncaught exception rather than a clean error.

### get
`azk get <id>`
Returns the full note (including body) plus every link touching it in either direction, or `{ error }` if not found.

### update
`echo '{"body":"..."}' | azk update <id>`
Partial update — any subset of `title`/`body`/`tags`. Returns `{ id, updated: true }` (not the updated fields themselves). Only re-embeds when `body` changes. Same stdin-must-be-valid-JSON gotcha as `create`.

### delete
`azk delete <id>`
Removes the note's file, its index entry, and any links referencing it (in either direction). Returns `{ id, deleted: true }`, or `{ error }` if not found.

### link
`azk link <fromId> <toId> "<relation>"`
Returns `{ fromId, toId, relation, linked: true }`, or `{ error }` if either id doesn't exist.

### reindex
`azk reindex`
Returns `{ indexed, updated, removed, total }`. Re-embeds only notes whose body actually changed; drops index entries for notes whose file no longer exists.
