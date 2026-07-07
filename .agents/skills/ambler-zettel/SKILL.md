---
name: ambler-zettel
description: Reference for the unified zettel task and its subcommands (search, create, get, update, delete, link, reindex) that back an Ambler project's Zettelkasten-RAG knowledge store — Markdown notes in `notes/`, indexed by a derived SQLite cache. Use this whenever you need to manually search, create, update, delete, or link a note — even if the user says "look up past notes", "save this learning", "what did we decide about X", or "connect these two notes". For installing the Zettelkasten into a project in the first place, use `/ambler-zettel-init` instead.
metadata:
  author: leandro
  version: "2.0"
---

# Ambler Zettel

A single `zettel` deno task with seven subcommands forms the CRUD surface of a project's Zettelkasten. Notes live as Markdown files with YAML frontmatter under `notes/<id>.md` — the version-controlled source of truth, editable in Obsidian/HelixNotes or by hand. `.zettelkasten/zettel.db` is a derived, gitignored SQLite index (full-text search, optional embeddings, and the link graph) rebuildable from `notes/` at any time via `reindex`. Every subcommand prints one JSON object or array to stdout — parse it directly, don't expect human-oriented prose. If a project doesn't have this task yet, run `/ambler-zettel-init` first.

## Search — find relevant notes before acting

```bash
deno task zettel search "<query>" [limit]
```

Blends FTS5 keyword matching with cosine-similarity re-rank against stored embeddings (only when a local embeddings host is reachable — degrades gracefully to keyword-only otherwise). Returns `[]` if nothing matches, or an array of `{ id, title, tags, created, score }` ordered best-first. `limit` defaults to 5.

## Create — capture a new atomic note

```bash
echo '{"title":"...","body":"...","tags":["..."],"links":[{"toId":"<id>","relation":"builds on"}]}' | deno task zettel create
```

`title` and `body` are required; `tags` and `links` are optional. One idea per note — if you're capturing two unrelated learnings, create two notes and link them if relevant, rather than combining them. Returns `{ id, title, tags, created, links }`.

## Get — fetch one note and its links

```bash
deno task zettel get <id>
```

Returns the full record plus every link touching it in either direction, or `{ error }` if the id doesn't exist.

## Update — revise an existing note

```bash
echo '{"body":"..."}' | deno task zettel update <id>
```

Any of `title`, `body`, `tags` may be provided (partial update). Only re-embeds when `body` changes. Prefer this over creating a duplicate note when existing guidance is merely stale.

## Delete — remove a note

```bash
deno task zettel delete <id>
```

Removes the note's Markdown file, its search index entry, and any links referencing it. Use when a note turns out wrong rather than leaving it to contradict newer notes.

## Link — connect two existing notes explicitly

```bash
deno task zettel link <fromId> <toId> "<relation phrase>"
```

The deliberate-linking step of the Zettelkasten method: a short phrase explaining *why* two notes connect (e.g. "contradicts", "builds on", "same root cause as") is what carries the intellectual value — not the folder or tag they happen to share. Run this after `zettel search` turns up something related that `zettel create`'s `links` didn't already capture.

## Reindex — rebuild the search index from `notes/`

```bash
deno task zettel reindex
```

Walks every `notes/*.md` file and rebuilds `.zettelkasten/zettel.db` from scratch: re-embeds only notes whose body actually changed, rebuilds the link graph from each note's frontmatter, and drops index entries for notes whose file no longer exists. Run this after cloning a repo (the index is gitignored, so a fresh checkout has none) or after hand-editing a note outside the `zettel` task. Returns `{ indexed, updated, removed, total }`.

## Guidelines

- **Atomicity**: one idea per note. Resist bundling a whole session's changes into a single zettel.
- **Search before create**: always run `zettel search` first so you link to (or update) related notes instead of creating near-duplicates.
- **Write for future retrieval**: a note should be understandable without the original conversation's context — state the decision and the *why*, not "changed X as discussed above".
