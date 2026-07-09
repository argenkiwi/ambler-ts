---
name: azk-init
description: Installs a Zettelkasten-RAG knowledge store into an Ambler project by vendoring the `azk` walk's actual code into it — version-controlled Markdown notes in `notes/`, a derived SQLite search index, the unified `azk` walk/nodes/utils, a project `AGENTS.md` enforcing retrieve-before/store-after, and a local copy of this skill. Use this whenever a user wants to add a knowledge base, notes, memory, or "second brain" to an Ambler project — even if they say "set up zettelkasten", "add RAG", "let the agent remember things", or "add AGENTS.md". Also use it for day-to-day search/create/get/update/delete/link/reindex once installed. For a global, project-independent `azk` command instead of vendoring code into this one project, use azk-install.
metadata:
  author: leandro
  version: "1.0"
---

# Azk Init

This skill installs a Zettelkasten (an atomic, explicitly-linked note store) into an Ambler project by vendoring the `azk` walk's code directly into it, so the project has its own `deno task azk` independent of any global install. It reuses `deno task clone` to bring in the walk/nodes/utils rather than duplicating that copy logic. It is fully self-contained: setup steps and the complete CRUD usage reference both live here.

If the project should instead rely on a global `azk` command (no code vendored in, no local `deno task azk`), use `azk-install` on the machine once instead — that skill never touches project files.

---

## Setup

### Step 1 — Determine the target directory

- If the user provided a directory path, use it.
- If not, use the current directory (`.`).
- The target must already be (or become) an Ambler project. If it isn't one yet, the `clone` call in Step 2 initializes it automatically (same as `/ambler-init`).

### Step 2 — Clone the unified azk walk

From the **ambler-ts** repo root (the source of these artifacts), run `deno task clone` to copy the unified walk plus its router node, all seven operation nodes (including `azk-reindex.ts`), and any utils (transitively resolved, including `utils/azk_db.ts`, `utils/azk_fs.ts`, `utils/azk_config.ts`, and `utils/embeddings.ts`) into the target, and register a matching task in the target's `deno.json`:

```bash
deno task clone walks/azk.ts "<target>"
```

If the target is not the current project, run this from wherever `ambler-ts`'s own `deno.json` lives (its `clone` task resolves source paths relative to that root).

### Step 3 — Create the notes directory

```bash
mkdir -p "<target>/notes"
```

`notes/*.md` (Markdown + YAML frontmatter) is the version-controlled source of truth — commit it like any other project file. The SQLite index at `.azk/azk.db` is a derived, gitignored cache created lazily on first use; do **not** create it directly, and do **not** read or write it directly — it always rebuilds from `notes/` via `azk reindex`.

If `<target>/.gitignore` doesn't already ignore `.azk/`, append a `.azk/` entry to it (binary, undiffable, and fully disposable — unlike `notes/`, which must stay tracked).

### Step 4 — Write or merge `AGENTS.md`

Read this skill's `assets/AGENTS.md` — it contains the "Zettelkasten RAG Protocol" section that instructs any agent working in the project to retrieve before implementing and store after, using the `deno task azk` subcommands.

- If `<target>/AGENTS.md` does **not** exist, write the asset's content as the full file.
- If it **does** exist, append the asset's content to the end, separated by a blank line — never overwrite existing instructions. If a "Zettelkasten RAG Protocol" section is already present, replace just that section instead of duplicating it — match on the heading text, not the exact heading level, in case it was hand-nested under a different level.

### Step 5 — Install this skill locally

Copy this skill's own directory into the target project, so it travels with the vendored code for future contributors/agents working there:

```bash
mkdir -p "<target>/.agents/skills"
cp -R "<this skill's directory>" "<target>/.agents/skills/azk-init"
```

### Step 6 — Verify

```bash
deno check "<target>/walks/azk.ts"
deno test "<target>/nodes/tests/"
```

Then smoke-test end to end from `<target>`:

```bash
echo '{"title":"test","body":"hello","tags":["test"]}' | deno task azk create
```

Confirm it prints a JSON object with an `id`, that `<target>/notes/<id>.md` now exists with frontmatter + body, and that `<target>/.azk/azk.db` was created as the derived index.

### Step 7 — Report success

```
Initialized Zettelkasten-RAG in "<target>":
  notes/                — Markdown notes with YAML frontmatter (source of truth, version-controlled)
  .azk/                  — derived SQLite search index (gitignored, created lazily)
  walks/azk.ts           — unified walk (search, create, get, update, delete, link, reindex)
  nodes/azk-router.ts    — subcommand dispatcher
  nodes/azk-*.ts         — one operation node per CRUD verb, plus reindex
  utils/azk_fs.ts        — Markdown/frontmatter read-write
  utils/azk_config.ts    — shared notes/db path config
  utils/azk_db.ts        — SQLite index: FTS5 + link graph + embedding cache
  utils/embeddings.ts    — optional semantic re-rank
  AGENTS.md              — retrieve-before/store-after protocol
  .agents/skills/azk-init/ — this skill, installed locally

Next steps:
  deno task azk search "<query>"   — before implementing
  deno task azk create             — after implementing (see AGENTS.md)
```

### Checklist before finishing

- [ ] The `azk` task is registered in `<target>/deno.json`.
- [ ] `<target>/notes/` exists and is tracked by git (not ignored).
- [ ] `<target>/.azk/` is ignored in `<target>/.gitignore`.
- [ ] `<target>/AGENTS.md` exists and contains the "Zettelkasten RAG Protocol" section, without clobbering any pre-existing content.
- [ ] `<target>/.agents/skills/azk-init/` exists (this skill, carried forward).
- [ ] `deno check` passes on the copied walk; `deno test` passes on the copied node tests.
- [ ] A smoke-test `azk create` call succeeds end to end and writes a file under `notes/`.

---

## Reference — the `azk` task's CRUD subcommands

A single `azk` deno task with seven subcommands forms the CRUD surface of the project's Zettelkasten. Notes live as Markdown files with YAML frontmatter under `notes/<id>.md` — the version-controlled source of truth, editable in Obsidian/HelixNotes or by hand. `.azk/azk.db` is a derived, gitignored SQLite index (full-text search, optional embeddings, and the link graph) rebuildable from `notes/` at any time via `reindex`. Every subcommand prints one JSON object or array to stdout — parse it directly, don't expect human-oriented prose.

### Search — find relevant notes before acting

```bash
deno task azk search "<query>" [limit]
```

Blends FTS5 keyword matching with cosine-similarity re-rank against stored embeddings (only when a local embeddings host is reachable — degrades gracefully to keyword-only otherwise). Returns `[]` if nothing matches, or an array of `{ id, title, tags, created, score }` ordered best-first. `limit` defaults to 5.

### Create — capture a new atomic note

```bash
echo '{"title":"...","body":"...","tags":["..."],"links":[{"toId":"<id>","relation":"builds on"}]}' | deno task azk create
```

`title` and `body` are required; `tags` and `links` are optional. One idea per note — if you're capturing two unrelated learnings, create two notes and link them if relevant, rather than combining them. Returns `{ id, title, tags, created, links }`.

### Get — fetch one note and its links

```bash
deno task azk get <id>
```

Returns the full record plus every link touching it in either direction, or `{ error }` if the id doesn't exist.

### Update — revise an existing note

```bash
echo '{"body":"..."}' | deno task azk update <id>
```

Any of `title`, `body`, `tags` may be provided (partial update). Only re-embeds when `body` changes. Prefer this over creating a duplicate note when existing guidance is merely stale.

### Delete — remove a note

```bash
deno task azk delete <id>
```

Removes the note's Markdown file, its search index entry, and any links referencing it. Use when a note turns out wrong rather than leaving it to contradict newer notes.

### Link — connect two existing notes explicitly

```bash
deno task azk link <fromId> <toId> "<relation phrase>"
```

The deliberate-linking step of the Zettelkasten method: a short phrase explaining *why* two notes connect (e.g. "contradicts", "builds on", "same root cause as") is what carries the intellectual value — not the folder or tag they happen to share. Run this after `azk search` turns up something related that `azk create`'s `links` didn't already capture.

### Reindex — rebuild the search index from `notes/`

```bash
deno task azk reindex
```

Walks every `notes/*.md` file and rebuilds `.azk/azk.db` from scratch: re-embeds only notes whose body actually changed, rebuilds the link graph from each note's frontmatter, and drops index entries for notes whose file no longer exists. Run this after cloning a repo (the index is gitignored, so a fresh checkout has none) or after hand-editing a note outside the `azk` task. Returns `{ indexed, updated, removed, total }`.

### Guidelines

- **Atomicity**: one idea per note. Resist bundling a whole session's changes into a single note.
- **Search before create**: always run `azk search` first so you link to (or update) related notes instead of creating near-duplicates.
- **Write for future retrieval**: a note should be understandable without the original conversation's context — state the decision and the *why*, not "changed X as discussed above".
