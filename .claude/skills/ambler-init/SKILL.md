---
name: ambler-init
description: Initializes a new Ambler state-machine project in an empty folder. Creates the directory structure, copies ambler.ts, generates deno.json and CLAUDE.md, and installs Claude Code skills (add-node, add-node-test, add-walk, add-walk-spec). Use this when a user wants to bootstrap a new Ambler project.
metadata:
  author: leandro
  version: "1.1"
---

# Ambler Init

> Install globally with: `npx skills add argenkiwi/ambler-ts -g`

This skill initializes a new Ambler project in an empty (or new) directory by writing template files from `assets/` into the target location.

## Template Files

All templates live in `~/.claude/skills/ambler-init/assets/`:

| Asset | Writes to |
|-------|-----------|
| `ambler.ts` | `<target>/ambler.ts` |
| `deno.json` | `<target>/deno.json` |
| `CLAUDE.md` | `<target>/CLAUDE.md` |
| `skills/add-node/SKILL.md` | `<target>/.claude/skills/add-node/SKILL.md` |
| `skills/add-node-test/SKILL.md` | `<target>/.claude/skills/add-node-test/SKILL.md` |
| `skills/add-walk/SKILL.md` | `<target>/.claude/skills/add-walk/SKILL.md` |
| `skills/add-walk-spec/SKILL.md` | `<target>/.claude/skills/add-walk-spec/SKILL.md` |

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
mkdir -p "<target>/nodes" \
         "<target>/walks" \
         "<target>/specs" \
         "<target>/.claude/skills/add-node" \
         "<target>/.claude/skills/add-node-test" \
         "<target>/.claude/skills/add-walk" \
         "<target>/.claude/skills/add-walk-spec"
```

### 4. Write template files

Read each file from `~/.claude/skills/ambler-init/assets/` and write it to the target:

1. Read `~/.claude/skills/ambler-init/assets/ambler.ts` → write to `<target>/ambler.ts`
2. Read `~/.claude/skills/ambler-init/assets/deno.json` → write to `<target>/deno.json`
3. Read `~/.claude/skills/ambler-init/assets/CLAUDE.md` → write to `<target>/CLAUDE.md`
4. Read `~/.claude/skills/ambler-init/assets/skills/add-node/SKILL.md` → write to `<target>/.claude/skills/add-node/SKILL.md`
5. Read `~/.claude/skills/ambler-init/assets/skills/add-node-test/SKILL.md` → write to `<target>/.claude/skills/add-node-test/SKILL.md`
6. Read `~/.claude/skills/ambler-init/assets/skills/add-walk/SKILL.md` → write to `<target>/.claude/skills/add-walk/SKILL.md`
7. Read `~/.claude/skills/ambler-init/assets/skills/add-walk-spec/SKILL.md` → write to `<target>/.claude/skills/add-walk-spec/SKILL.md`

Read and write all 7 files. Do not skip any.

### 5. Verify

Type-check the generated `ambler.ts`:

```bash
deno check "<target>/ambler.ts"
```

### 6. Report success

```
Initialized Ambler project in "<target>":
  ambler.ts
  deno.json
  CLAUDE.md
  .claude/skills/add-node/SKILL.md
  .claude/skills/add-node-test/SKILL.md
  .claude/skills/add-walk/SKILL.md
  .claude/skills/add-walk-spec/SKILL.md

Next steps:
  /add-walk   — create your first walk
  /add-node   — create a standalone node
```
