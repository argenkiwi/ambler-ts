---
name: ambler-init
description: Initializes a new Ambler state-machine project in an empty folder. Creates the directory structure, copies ambler.ts, generates deno.json and AGENTS.md, and installs Claude Code skills (add-node, add-node-test, add-walk, add-walk-spec). Use this when a user wants to bootstrap a new Ambler project.
metadata:
  author: leandro
  version: "1.2"
---

# Ambler Init

> Install globally with: `npx skills add argenkiwi/ambler-ts -g -s ambler-init`

This skill initializes a new Ambler project in an empty (or new) directory.

## Template Files

Three core files are read from `~/.claude/skills/ambler-init/assets/` and written to the target. A fourth (`CLAUDE.md`) is generated inline.

| Source | Writes to |
|--------|-----------|
| `ambler.ts` | `<target>/ambler.ts` |
| `deno.json` | `<target>/deno.json` |
| `AGENTS.md` | `<target>/AGENTS.md` |
| *(inline)* | `<target>/CLAUDE.md` → `@AGENTS.md` |

Dev skills are installed by the `skills` CLI — no bundled copies needed.

---

## Steps

### 1. Determine the target directory

- If the user provided a directory path, use it.
- If not, ask: "What directory should the new Ambler project be created in?"

### 2. Validate the target directory

Use the Bash tool to check:

```bash
[ -d "<target>" ] && ls -A "<target>" | head -1
```

- **Does not exist** → will be created in step 3, proceed.
- **Exists and is empty** → proceed.
- **Exists and is non-empty** → stop and tell the user: `"<target>" is not empty. Provide an empty or non-existent directory.`

### 3. Create the directory structure

```bash
mkdir -p "<target>/nodes" "<target>/walks" "<target>/specs"
```

### 4. Write template files

Read from `~/.claude/skills/ambler-init/assets/` and write to the target. Also generate `CLAUDE.md` inline.

1. Read `~/.claude/skills/ambler-init/assets/ambler.ts` → write to `<target>/ambler.ts`
2. Read `~/.claude/skills/ambler-init/assets/deno.json` → write to `<target>/deno.json`
3. Read `~/.claude/skills/ambler-init/assets/AGENTS.md` → write to `<target>/AGENTS.md`
4. Write `<target>/CLAUDE.md` with this exact content:
   ```
   @AGENTS.md
   ```

Read and write all 4 files. Do not skip any.

### 5. Install dev skills

Run in the target directory:

```bash
cd "<target>" && npx skills add argenkiwi/ambler-ts
```

This installs `add-node`, `add-node-test`, `add-walk`, `add-walk-spec`, and `add-skill` into `.claude/skills/`.

### 6. Verify

Type-check the generated `ambler.ts`:

```bash
deno check "<target>/ambler.ts"
```

### 7. Report success

```
Initialized Ambler project in "<target>":
  ambler.ts
  deno.json
  AGENTS.md
  CLAUDE.md

Skills installed via npx:
  .claude/skills/add-node/
  .claude/skills/add-node-test/
  .claude/skills/add-walk/
  .claude/skills/add-walk-spec/
  .claude/skills/add-skill/

Next steps:
  /add-walk   — create your first walk
  /add-node   — create a standalone node
```
