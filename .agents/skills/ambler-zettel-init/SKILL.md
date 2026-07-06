---
name: ambler-zettel-init
description: Initializes a Zettelkasten-RAG knowledge store in an Ambler project — the SQLite-backed note store plus the six zettel-* CRUD walks and an AGENTS.md enforcing retrieve-before/store-after on every prompt. Use this whenever a user wants to add a knowledge base, notes, memory, or "second brain" to an Ambler project — even if they say "set up zettelkasten", "add RAG", "let the agent remember things", or "add AGENTS.md".
metadata:
  author: leandro
  version: "1.0"
---

# Ambler Zettel Init

This skill installs a Zettelkasten (an atomic, explicitly-linked note store) into an Ambler project, so a coding agent can retrieve relevant prior decisions before implementing a prompt and record new learnings after. It reuses `deno task clone` to bring in the walks/nodes/utils rather than duplicating that copy logic.

---

## Step 1 — Determine the target directory

- If the user provided a directory path, use it.
- If not, use the current directory (`.`).
- The target must already be (or become) an Ambler project. If it isn't one yet, the `clone` calls in Step 2 will initialize it automatically (same as `/ambler-init`).

---

## Step 2 — Clone the six zettel walks

From the **ambler-ts** repo root (the source of these artifacts), run `deno task clone` once per verb. Each call copies the walk plus its node and any utils (transitively resolved, including `utils/zettel_db.ts` and `utils/embeddings.ts`) into the target, and registers a matching task in the target's `deno.json`:

```bash
deno task clone walks/zettel-create.ts "<target>"
deno task clone walks/zettel-get.ts "<target>"
deno task clone walks/zettel-update.ts "<target>"
deno task clone walks/zettel-delete.ts "<target>"
deno task clone walks/zettel-search.ts "<target>"
deno task clone walks/zettel-link.ts "<target>"
```

If the target is not the current project, run these from wherever `ambler-ts`'s own `deno.json` lives (its `clone` task resolves source paths relative to that root).

---

## Step 3 — Create the Zettelkasten directory

```bash
mkdir -p "<target>/.zettelkasten"
```

The SQLite database file (`zettel.db`) and its schema are created lazily on first use — no seed file is required. Do **not** create `.zettelkasten/zettel.db` directly; let the first `zettel-create` (or any CRUD) call do it.

---

## Step 4 — Write or merge `AGENTS.md`

Read this skill's `assets/AGENTS.md` — it contains the "Zettelkasten RAG Protocol" section that instructs any agent working in the project to retrieve before implementing and store after, using the six `zettel-*` tasks.

- If `<target>/AGENTS.md` does **not** exist, write the asset's content as the full file.
- If it **does** exist, append the asset's content to the end, separated by a blank line — never overwrite existing instructions. If a "## Zettelkasten RAG Protocol" section is already present, replace just that section instead of duplicating it.

---

## Step 5 — Verify

```bash
deno check "<target>/walks/zettel-create.ts"
deno test "<target>/nodes/tests/"
```

Then smoke-test end to end from `<target>`:

```bash
echo '{"title":"test","body":"hello","tags":["test"]}' | deno task zettel-create
```

Confirm it prints a JSON object with an `id`, and that `<target>/.zettelkasten/zettel.db` now exists.

---

## Step 6 — Report success

```
Initialized Zettelkasten-RAG in "<target>":
  .zettelkasten/           — SQLite note store (created lazily)
  walks/zettel-*.ts        — create, get, update, delete, search, link
  nodes/zettel-*.ts        — one per CRUD verb
  utils/zettel_db.ts       — SQLite + FTS5 access
  utils/embeddings.ts      — optional semantic re-rank
  AGENTS.md                — retrieve-before/store-after protocol

Next steps:
  deno task zettel-search "<query>"   — before implementing
  deno task zettel-create             — after implementing (see AGENTS.md)
```

---

## Checklist before finishing

- [ ] All six `zettel-*` tasks are registered in `<target>/deno.json`.
- [ ] `<target>/.zettelkasten/` exists (directory only — the db file appears on first use).
- [ ] `<target>/AGENTS.md` exists and contains the "Zettelkasten RAG Protocol" section, without clobbering any pre-existing content.
- [ ] `deno check` passes on the copied walks; `deno test` passes on the copied node tests.
- [ ] A smoke-test `zettel-create` call succeeds end to end.
