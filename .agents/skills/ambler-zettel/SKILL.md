---
name: ambler-zettel
description: Reference for the six zettel-* CRUD tasks (create, get, update, delete, search, link) that back an Ambler project's Zettelkasten-RAG knowledge store. Use this whenever you need to manually search, create, update, delete, or link a note — even if the user says "look up past notes", "save this learning", "what did we decide about X", or "connect these two notes". For installing the Zettelkasten into a project in the first place, use `/ambler-zettel-init` instead.
metadata:
  author: leandro
  version: "1.0"
---

# Ambler Zettel

Six deno tasks form the CRUD surface of a project's Zettelkasten (`.zettelkasten/zettel.db`). Every task prints one JSON object or array to stdout — parse it directly, don't expect human-oriented prose. If a project doesn't have these tasks yet, run `/ambler-zettel-init` first.

## Search — find relevant notes before acting

```bash
deno task zettel-search "<query>" [limit]
```

Blends FTS5 keyword matching with cosine-similarity re-rank against stored embeddings (only when a local embeddings host is reachable — degrades gracefully to keyword-only otherwise). Returns `[]` if nothing matches, or an array of `{ id, title, tags, created, score }` ordered best-first. `limit` defaults to 5.

## Create — capture a new atomic note

```bash
echo '{"title":"...","body":"...","tags":["..."],"links":[{"toId":"<id>","relation":"builds on"}]}' | deno task zettel-create
```

`title` and `body` are required; `tags` and `links` are optional. One idea per note — if you're capturing two unrelated learnings, create two notes and link them if relevant, rather than combining them. Returns `{ id, title, tags, created, links }`.

## Get — fetch one note and its links

```bash
deno task zettel-get <id>
```

Returns the full record plus every link touching it in either direction, or `{ error }` if the id doesn't exist.

## Update — revise an existing note

```bash
echo '{"body":"..."}' | deno task zettel-update <id>
```

Any of `title`, `body`, `tags` may be provided (partial update). Only re-embeds when `body` changes. Prefer this over creating a duplicate note when existing guidance is merely stale.

## Delete — remove a note

```bash
deno task zettel-delete <id>
```

Removes the note, its search index entry, and any links referencing it. Use when a note turns out wrong rather than leaving it to contradict newer notes.

## Link — connect two existing notes explicitly

```bash
deno task zettel-link <fromId> <toId> "<relation phrase>"
```

The deliberate-linking step of the Zettelkasten method: a short phrase explaining *why* two notes connect (e.g. "contradicts", "builds on", "same root cause as") is what carries the intellectual value — not the folder or tag they happen to share. Run this after `zettel-search` turns up something related that `zettel-create`'s `links` didn't already capture.

## Guidelines

- **Atomicity**: one idea per note. Resist bundling a whole session's changes into a single zettel.
- **Search before create**: always run `zettel-search` first so you link to (or update) related notes instead of creating near-duplicates.
- **Write for future retrieval**: a note should be understandable without the original conversation's context — state the decision and the *why*, not "changed X as discussed above".
