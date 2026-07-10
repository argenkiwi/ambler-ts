---
name: azk-install
description: Installs the `azk` CLI globally for the current user — a one-time, project-independent setup so any workspace can use `azk search/create/get/update/delete/link/reindex` as a bare command, backed by ambler-ts's Zettelkasten-RAG walk. Also installs the on-demand `azk-reference` skill (CRUD JSON shapes and gotchas) into the current agent's own global skills directory. Use this whenever a user wants to install azk (or "the zettel/zettelkasten command") globally, system-wide, or for every project, without vendoring the walk's code into any specific project. For vendoring the walk's code into one Ambler project instead (so it doesn't depend on this global install), use azk-init.
metadata:
  author: leandro
  version: "1.0"
---

# Azk Install

Installs the `azk` binary globally (via `deno install --global`), wires up the *current agent's own* global configuration, and installs the on-demand `azk-reference` skill globally, so the Zettelkasten-RAG methodology is available in every workspace without any per-project setup. This skill never touches project files — a project that relies on this global install just gets `notes/` and `.azk/` created lazily on first use, wherever `azk` happens to be invoked.

For a project that instead wants the walk's code vendored in locally (its own `deno task azk`, independent of this global install), use `azk-init` instead.

---

## Step 1 — Locate the source repo

`azk` is built from the `ambler-ts` repo (the one containing `deno.json` and `walks/azk.ts`):

- If this skill is being run from within an `ambler-ts` checkout, use the current directory.
- Otherwise, ask the user for the path to their local `ambler-ts` clone.

All commands below use `<repo>` for this path.

---

## Step 2 — Install the binary globally

```bash
deno install --global --force --allow-read --allow-write --allow-net --allow-env --env-file \
  --config "<repo>/deno.json" -n azk "<repo>/walks/azk.ts"
```

`--force` is required, not optional — this skill is meant to be re-run whenever `ambler-ts` changes, and `deno install --global` refuses to overwrite an existing `azk` install without it (it'll fail with "Existing installation found" otherwise).

Confirm the Deno installation bin directory (typically `~/.deno/bin` on macOS/Linux) is on the shell's `PATH`. If `azk` isn't found after installing, that's almost always why — tell the user to add it to their shell profile (`~/.zshrc`, `~/.bashrc`, etc.) and re-open their shell.

---

## Step 3 — Merge the global Zettelkasten protocol

Read this skill's `assets/AGENTS.md` — the bare-`azk`-command variant of the "Zettelkasten RAG Protocol" (uses `azk search`/`azk create`/etc. directly, not `deno task azk ...`).

Merge it into **your own** global instructions file — whichever one you already know applies to every project you work in (e.g. `~/.claude/CLAUDE.md` for Claude Code, `~/.gemini/config/AGENTS.md` for Gemini CLI). Don't guess a path for a different agent; use the one you actually read your own global instructions from.

- If that file doesn't contain a "Zettelkasten RAG Protocol" section yet, append the asset's content to the end, separated by a blank line — never overwrite existing instructions.
- If a "# Zettelkasten RAG Protocol" section is already present (e.g. from a previous install), replace just that section instead of duplicating it — match on the heading text, not the exact heading level, since some global instruction files may nest it under a parent section.

---

## Step 4 — Install the azk-reference skill globally

Copy this skill's `assets/azk-reference/` directory into **your own** global skills directory — whichever one you already know applies to every project you work in (e.g. `~/.claude/skills/` for Claude Code). Don't guess a path for a different agent; use the one you actually load your own skills from.

```bash
cp -R "<repo>/.agents/skills/azk-install/assets/azk-reference" "<your global skills dir>/azk-reference"
```

If a stale `zettel` skill directory already exists in that same global skills directory (e.g. `~/.claude/skills/zettel/`), delete it — it's a pre-rebrand leftover documenting a `zettel` command and `.zettelkasten/zettel.db` path that no longer exist (everything was renamed to `azk`/`.azk/azk.db`), and it's now fully superseded by `azk-reference`.

---

## Step 5 — Verify

From a directory *outside* this repo, confirm the global install actually resolves and runs standalone. Use whatever scratch/temp directory is appropriate for the current agent's environment (e.g. a dedicated scratchpad directory if one applies) rather than defaulting to `/tmp`:

```bash
cd "<scratch-dir>" && azk reindex && azk search "test" && \
  echo '{"title":"smoke test","body":"verifying the global azk install"}' | azk create
```

`reindex`/`search` alone only create `.azk/` — `notes/` is created lazily by `azk_fs.ts` the first time a note is actually written, so the `create` call above is what proves "no per-project init needed" in practice. Confirm all three commands run without error and that both `notes/` and `.azk/` now exist in that directory with no pre-existing scaffolding.

---

## Step 6 — Report success

```
Installed azk globally:
  binary          — `azk`, on PATH via deno install --global
  global config   — Zettelkasten RAG Protocol merged into <path to the agent's own global instructions file>
  global skill    — azk-reference installed into <your global skills dir>/azk-reference (CRUD JSON shapes, gotchas)

Any workspace can now use `azk search`/`azk create`/`azk get`/`azk update`/`azk delete`/`azk link`/`azk reindex` directly — `notes/` and `.azk/` are created lazily on first use.

Next step (optional): use /azk-init in an Ambler project that wants the walk's code vendored in locally instead of relying on this global install.
```

---

## Checklist before finishing

- [ ] `azk` resolves on `PATH` and runs from a directory outside `<repo>`.
- [ ] The agent's own global instructions file contains exactly one "Zettelkasten RAG Protocol" section, using the bare `azk <cmd>` form (not `deno task azk`).
- [ ] `azk-reference` exists in the agent's own global skills directory.
- [ ] Any stale `zettel` skill directory in that same location has been removed.
- [ ] No files were created or modified inside any project directory — this skill only touches the global binary install, the agent's global config, and the agent's global skills directory.
