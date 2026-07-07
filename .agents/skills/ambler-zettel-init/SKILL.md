---
name: ambler-zettel-init
description: Initializes a Zettelkasten-RAG knowledge store in an Ambler project — version-controlled Markdown notes in `notes/`, a derived SQLite search index, the unified zettel walk, and an AGENTS.md enforcing retrieve-before/store-after on every prompt. Use this whenever a user wants to add a knowledge base, notes, memory, or "second brain" to an Ambler project — even if they say "set up zettelkasten", "add RAG", "let the agent remember things", or "add AGENTS.md".
metadata:
  author: leandro
  version: "3.0"
---

# Ambler Zettel Init

This skill installs a Zettelkasten (an atomic, explicitly-linked note store) into an Ambler project, so a coding agent can retrieve relevant prior decisions before implementing a prompt and record new learnings after. Notes are Markdown files with YAML frontmatter under `notes/` — the version-controlled source of truth — indexed by a derived, gitignored SQLite cache at `.zettelkasten/zettel.db` for fast full-text and semantic search. It reuses `deno task ambler clone` to bring in the walk/nodes/utils rather than duplicating that copy logic.

---

## Step 1 — Determine the target directory

- If the user provided a directory path, use it.
- If not, use the current directory (`.`).
- The target must already be (or become) an Ambler project. If it isn't one yet, the `clone` calls in Step 2 will initialize it automatically (same as `/ambler-init`).

---

## Step 2 — Clone the unified zettel walk

From the **ambler-ts** repo root (the source of these artifacts), run `deno task ambler clone` to copy the unified walk plus its router node, all seven operation nodes (including `zettel-reindex.ts`), and any utils (transitively resolved, including `utils/zettel_db.ts`, `utils/zettel_fs.ts`, `utils/zettel_config.ts`, and `utils/embeddings.ts`) into the target, and register a matching task in the target's `deno.json`:

```bash
deno task ambler clone walks/zettel.ts "<target>"
```

If the target is not the current project, run this from wherever `ambler-ts`'s own `deno.json` lives (its `ambler` task's `clone` action resolves source paths relative to that root).

---

## Step 3 — Create the notes directory

```bash
mkdir -p "<target>/notes"
```

`notes/*.md` (Markdown + YAML frontmatter) is the version-controlled source of truth — commit it like any other project file. The SQLite index at `.zettelkasten/zettel.db` is a derived, gitignored cache created lazily on first use; do **not** create it directly, and do **not** read or write it directly — it always rebuilds from `notes/` via `zettel reindex`.

If `<target>/.gitignore` doesn't already ignore `.zettelkasten/`, append a `.zettelkasten/` entry to it (binary, undiffable, and fully disposable — unlike `notes/`, which must stay tracked).

---

## Step 4 — Write or merge `AGENTS.md`

Read this skill's `assets/AGENTS.md` — it contains the "Zettelkasten RAG Protocol" section that instructs any agent working in the project to retrieve before implementing and store after, using the `zettel` task subcommands.

- If `<target>/AGENTS.md` does **not** exist, write the asset's content as the full file.
- If it **does** exist, append the asset's content to the end, separated by a blank line — never overwrite existing instructions. If a "## Zettelkasten RAG Protocol" section is already present, replace just that section instead of duplicating it.

---

## Step 5 — Verify

```bash
deno check "<target>/walks/zettel.ts"
deno test "<target>/nodes/tests/"
```

Then smoke-test end to end from `<target>`:

```bash
echo '{"title":"test","body":"hello","tags":["test"]}' | deno task zettel create
```

Confirm it prints a JSON object with an `id`, that `<target>/notes/<id>.md` now exists with frontmatter + body, and that `<target>/.zettelkasten/zettel.db` was created as the derived index.

---

## Step 6 — Report success

```
Initialized Zettelkasten-RAG in "<target>":
  notes/                   — Markdown notes with YAML frontmatter (source of truth, version-controlled)
  .zettelkasten/           — derived SQLite search index (gitignored, created lazily)
  walks/zettel.ts          — unified walk (search, create, get, update, delete, link, reindex)
  nodes/zettel-router.ts   — subcommand dispatcher
  nodes/zettel-*.ts        — one operation node per CRUD verb, plus reindex
  utils/zettel_fs.ts       — Markdown/frontmatter read-write
  utils/zettel_config.ts   — shared notes/db path config
  utils/zettel_db.ts       — SQLite index: FTS5 + link graph + embedding cache
  utils/embeddings.ts      — optional semantic re-rank
  AGENTS.md                — retrieve-before/store-after protocol

Next steps:
  deno task zettel search "<query>"   — before implementing
  deno task zettel create             — after implementing (see AGENTS.md)
```

---

## Checklist before finishing

- [ ] The `zettel` task is registered in `<target>/deno.json`.
- [ ] `<target>/notes/` exists and is tracked by git (not ignored).
- [ ] `<target>/.zettelkasten/` is ignored in `<target>/.gitignore`.
- [ ] `<target>/AGENTS.md` exists and contains the "Zettelkasten RAG Protocol" section, without clobbering any pre-existing content.
- [ ] `deno check` passes on the copied walk; `deno test` passes on the copied node tests.
- [ ] A smoke-test `zettel create` call succeeds end to end and writes a file under `notes/`.
