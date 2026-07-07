## Zettelkasten RAG Protocol

This project has a Zettelkasten — an atomic, explicitly-linked note store. Notes are Markdown files with YAML frontmatter under `notes/` (the version-controlled source of truth, editable in Obsidian/HelixNotes or by hand); `.zettelkasten/zettel.db` is a derived, gitignored SQLite index (full-text search, optional semantic embeddings, and the link graph) rebuildable from `notes/` at any time. It exists so design decisions and gotchas compound across sessions instead of being re-discovered every time. Use it via the `zettel` deno task below; do not read or write `.zettelkasten/zettel.db` directly. If you ever hand-edit a file under `notes/`, run `deno task zettel reindex` afterward so the index reflects it.

**Before implementing any non-trivial prompt:**

```bash
deno task zettel search "<short summary of the task>"
```

Read the returned notes before writing code. If a note is directly relevant, treat it as prior art — don't rediscover a decision that's already been made (or, if you disagree with it, say so and update it).

**After completing the work:**

```bash
echo '{"title":"<short title>","body":"<what you decided or learned, and why>","tags":["<tag>"],"links":[{"toId":"<id>","relation":"<short phrase>"}]}' | deno task zettel create
```

Capture the *non-obvious* part — a decision, a constraint, a gotcha — not a restatement of the diff. One idea per note. If it builds on or contradicts a note found during search, include it in `links` with a short relation phrase (e.g. "builds on", "supersedes").

**When existing guidance turns out stale or wrong:**

```bash
echo '{"title":"..."}' | deno task zettel update <id>   # partial {title?,body?,tags?} via stdin
deno task zettel delete <id>
```

Prefer updating over leaving a contradicting note next to the old one.

**To connect two existing notes explicitly** (the deliberate-linking step, independent of creation-time links):

```bash
deno task zettel link <fromId> <toId> "<relation phrase>"
```

**To fetch one note and its links:**

```bash
deno task zettel get <id>
```

**After a fresh clone, or if the index ever drifts from the Markdown files:**

```bash
deno task zettel reindex
```

The index is gitignored, so a fresh checkout starts with none — run this once before the first `search`. It's always safe to delete `.zettelkasten/` and rebuild it this way.

All seven subcommands print a single JSON object/array to stdout — parse it directly. Search blends keyword (FTS5) and, when a local OpenAI-compatible embeddings host is reachable (default `http://localhost:11434/v1`, model `nomic-embed-text`), semantic similarity — it degrades gracefully to keyword-only if no such host is running.
