---
name: ambler-init
description: Initializes a new Ambler state-machine project. Creates the directory structure, copies ambler.ts, generates deno.json and AGENTS.md. Use this when a user wants to bootstrap a new Ambler project.
metadata:
  author: leandro
  version: "1.3"
---

# Ambler Init

> Install locally with: `npx skills add argenkiwi/ambler-ts`

This skill initializes a new Ambler project.

## Template Files

Three core files are read from `~/.claude/skills/ambler-init/assets/` and written to the target. A fourth (`CLAUDE.md`) is generated inline.

| Source | Writes to |
|--------|-----------|
| `ambler.ts` | `<target>/ambler.ts` |
| `deno.json` | `<target>/deno.json` |
| `AGENTS.md` | `<target>/AGENTS.md` |
| *(inline)* | `<target>/CLAUDE.md` → `@AGENTS.md` |

---

## Steps

### 1. Determine the target directory

- If the user provided a directory path, use it.
- If not, use the current directory (`.`).

### 2. Prepare the target directory

- If the directory does not exist, it will be created in step 3.

### 3. Create the directory structure

```bash
mkdir -p "<target>/nodes" "<target>/walks" "<target>/specs" "<target>/utils"
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
  AGENTS.md
  CLAUDE.md
  nodes/
  walks/
  specs/
  utils/

Next steps:
  /ambler-walk   — create your first walk
  /ambler-node   — create a standalone node
```

