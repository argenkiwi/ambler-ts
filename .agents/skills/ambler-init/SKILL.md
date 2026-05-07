---
name: ambler-init
description: Initializes a new Ambler state-machine project. Use this whenever a user wants to start a new Ambler project, bootstrap a state-machine app, or set up the Ambler folder structure — even if they just say "new project" or "set up ambler" or "create ambler folder".
metadata:
  author: leandro
  version: "1.8"
---

# Ambler Init

> Install locally with: `npx skills add argenkiwi/ambler-ts`

This skill initializes a new Ambler project.

## Template Files

Two core files are read from the `assets/` directory within this skill and written to the target.

| Source | Writes to |
|--------|-----------|
| `assets/ambler.ts` | `<target>/ambler.ts` |
| `assets/deno.json` | `<target>/deno.json` |

---

## Steps

### 1. Determine the target directory

- If the user provided a directory path, use it.
- If not, use the current directory (`.`).

### 2. Prepare the target directory

- If the directory does not exist, it will be created in step 3.

### 3. Create the directory structure

```bash
mkdir -p "<target>/cores/tests" "<target>/walks" "<target>/specs" "<target>/utils"
```

### 4. Write template files

Read from the `assets/` directory within this skill and write to the target.

1. Read `assets/ambler.ts` → write to `<target>/ambler.ts`
2. Read `assets/deno.json` → write to `<target>/deno.json`

Read and write both files. Do not skip any.

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
  cores/
  walks/
  specs/
  utils/

Next steps:
  /ambler-walk   — create your first walk
  /ambler-core   — create a standalone core
```

```

