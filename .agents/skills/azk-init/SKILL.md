---
name: azk-init
description: Installs a Zettelkasten-RAG knowledge store into an Ambler project by vendoring the `azk` walk's actual code into it — version-controlled Markdown notes in `notes/`, a derived SQLite search index, the unified `azk` walk/nodes/utils, a project `AGENTS.md` enforcing retrieve-before/store-after, and local copies of this skill and azk-reference. Use this whenever a user wants to add a knowledge base, notes, memory, or "second brain" to an Ambler project — even if they say "set up zettelkasten", "add RAG", "let the agent remember things", or "add AGENTS.md". For day-to-day search/create/get/update/delete/link/reindex once installed, use azk-reference instead. For a global, project-independent `azk` command instead of vendoring code into this one project, use azk-install.
metadata:
  author: leandro
  version: "1.0"
---

# Azk Init

This skill installs a Zettelkasten (an atomic, explicitly-linked note store) into an Ambler project by vendoring the `azk` walk's code directly into it, so the project has its own `deno task azk` independent of any global install. It reuses `deno task clone` to bring in the walk/nodes/utils rather than duplicating that copy logic. It only covers one-time setup — for the CRUD usage reference (JSON shapes, gotchas), see the sibling `azk-reference` skill installed alongside it.

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

### Step 5 — Install this skill and azk-reference locally

Copy this skill's own directory, and the sibling `azk-reference` skill (the CRUD usage reference), into the target project, so both travel with the vendored code for future contributors/agents working there:

```bash
mkdir -p "<target>/.agents/skills"
cp -R "<this skill's directory>" "<target>/.agents/skills/azk-init"
cp -R "<azk-reference skill's directory>" "<target>/.agents/skills/azk-reference"
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
  .agents/skills/azk-init/      — this skill, installed locally
  .agents/skills/azk-reference/ — CRUD usage reference (JSON shapes, gotchas), installed locally

Next steps:
  deno task azk search "<query>"   — before implementing
  deno task azk create             — after implementing (see AGENTS.md)
  See the azk-reference skill for exact JSON output shapes and gotchas per subcommand.
```

### Checklist before finishing

- [ ] The `azk` task is registered in `<target>/deno.json`.
- [ ] `<target>/notes/` exists and is tracked by git (not ignored).
- [ ] `<target>/.azk/` is ignored in `<target>/.gitignore`.
- [ ] `<target>/AGENTS.md` exists and contains the "Zettelkasten RAG Protocol" section, without clobbering any pre-existing content.
- [ ] `<target>/.agents/skills/azk-init/` exists (this skill, carried forward).
- [ ] `<target>/.agents/skills/azk-reference/` exists (CRUD usage reference, carried forward).
- [ ] `deno check` passes on the copied walk; `deno test` passes on the copied node tests.
- [ ] A smoke-test `azk create` call succeeds end to end and writes a file under `notes/`.
