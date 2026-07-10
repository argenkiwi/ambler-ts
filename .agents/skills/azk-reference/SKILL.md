---
name: azk-reference
description: On-demand reference for a project's already-installed vendored `azk` deno task — exact JSON output shapes and non-obvious gotchas per subcommand (search, create, get, update, delete, link, reindex) that aren't covered by the walk's own usage/error output. Use this once `azk-init` has already installed the walk, whenever you're about to run a CRUD operation and need to know the response shape or an edge case (e.g. what happens on empty stdin, what partial update returns, what delete cascades to). For installing the walk into a project in the first place, use azk-init instead.
metadata:
  author: leandro
  version: "1.0"
---

# Azk Reference

Syntax for all 7 subcommands is self-documented: run `deno task azk` with no arguments for the full list, or run any subcommand with a missing/invalid *CLI argument* for its own `Usage: ...` string. That only covers argument validation — `create` and `update` take their real payload over stdin, so a stdin problem never produces a `Usage:` string (see their gotchas below). This reference covers what none of that runtime output does: exact JSON shapes, and gotchas.

**Exit code isn't a reliable success signal.** CLI-argument validation (missing query/id/fromId, malformed JSON on stdin) calls `Deno.exit(1)`. But failures raised *inside* a subcommand — `get`/`update`/`delete`'s "not found", `link`'s "one or both ids not found", `create`'s write/embed failure — print `{ error }` and the process still exits **0**. Always check for a top-level `error` key in the JSON; don't gate on exit code alone except for the argument-validation cases above.

### search
`deno task azk search "<query>" [limit]` — `limit` defaults to 5.
Returns `{ id, title, tags, created, score }[]`, best-first, or `[]`. Degrades to keyword-only (FTS5) if no embeddings host is reachable. An empty result isn't an error — still exit 0.

### create
`echo '{"title":"...","body":"...","tags":[...],"links":[{"toId":"...","relation":"..."}]}' | deno task azk create`
Returns `{ id, title, tags, created, links }`, or `{ error }` (exit 0 — see above).
Gotchas:
- Malformed or empty stdin JSON crashes with an uncaught exception (stack trace, non-zero exit) during parsing — but once parsing succeeds, a missing `title`/`body` gets a clean `{ error: "title and body are required" }` and exit 1 instead.
- `links` isn't validated against existing ids — a `toId` that doesn't exist is stored as a dangling link anyway (unlike the standalone `link` subcommand, which checks both ids exist first). `reindex` won't clean it up either, since it trusts each note's own frontmatter links without checking the target exists.

### get
`deno task azk get <id>`
Returns the full note (including body) plus every link touching it in either direction, or `{ error }` if not found (exit 0).

### update
`echo '{"body":"..."}' | deno task azk update <id>`
Partial update — any subset of `title`/`body`/`tags`. Returns `{ id, updated: true }` (not the updated fields themselves). Only re-embeds when `body` changes. Same stdin-parsing gotcha as `create`; a missing id's `{ error }` is exit 0 too.

### delete
`deno task azk delete <id>`
Removes the note's file, its index entry, and any links referencing it (in either direction). Returns `{ id, deleted: true }`, or `{ error }` if not found (exit 0).

### link
`deno task azk link <fromId> <toId> "<relation>"`
Returns `{ fromId, toId, relation, linked: true }`, or `{ error }` if either id doesn't exist (exit 0).

### reindex
`deno task azk reindex`
Returns `{ indexed, updated, removed, total }`. Re-embeds only notes whose body actually changed; drops index entries for notes whose file no longer exists.
