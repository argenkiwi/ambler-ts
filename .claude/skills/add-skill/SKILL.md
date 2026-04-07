---
name: add-skill
description: Creates a new skill in the .skills/ directory following the project's skill format. Use this when the user asks to create, add, or scaffold a new skill.
metadata:
  author: leandro
  version: "1.0"
---

# Add Skill

Follow these steps to create a new skill:

## 1. Determine the skill name and description

- Ask the user for the skill's purpose if not already clear.
- Choose a name: lowercase letters, numbers, and hyphens only, max 64 characters.
- Write a description: what the skill does and when to use it, max 1024 characters.

## 2. Create the skill directory

Create a directory at `.skills/<skill-name>/`.

## 3. Create the SKILL.md file

Create `.skills/<skill-name>/SKILL.md` with this structure:

```markdown
---
name: <skill-name>
description: <description of what this skill does and when to use it>
metadata:
  author: <author>
  version: "1.0"
---

# <Skill Title>

<Instructions that guide the agent's behavior when this skill is active.>
```

### Guidelines for the body content

- Aim for 10k–20k characters (~2,500–5,000 tokens).
- If instructions are longer, move detailed documentation to `references/` files and link to them with relative paths.
- Be specific and actionable — write instructions as steps the agent should follow.

## 4. Add optional resource directories (if needed)

Inside `.skills/<skill-name>/`, you may create:

- `scripts/` — executable scripts (Python, Bash) the agent can run.
- `references/` — detailed technical docs, API references, or guides.
- `assets/` — templates, diagrams, JSON schemas, etc.

Reference these from `SKILL.md` using relative paths, e.g. `Run the script at scripts/setup.sh`.

## 5. Verify the result

Confirm the final layout looks like:

```
.skills/
  <skill-name>/
    SKILL.md
    scripts/      (optional)
    references/   (optional)
    assets/       (optional)
```

The agent will automatically discover the skill and load its metadata. The full `SKILL.md` body is only pulled into context when the skill is activated.
