# Global Zettelkasten CLI Installation & Setup

This directory contains the necessary files to configure and use `zettel` as a global, user-level command for knowledge management across all your workspaces.

## 1. Install `zettel` Globally

To make the `zettel` command available globally in your shell, run:

```bash
deno install --global --allow-read --allow-write --allow-net --allow-env --env-file --config /path/to/ambler-ts/deno.json -n zettel /path/to/ambler-ts/walks/zettel.ts
```

> [!NOTE]
> Replace `/path/to/ambler-ts/` with the absolute path to your local clone of the `ambler-ts` repository.

Ensure that your Deno installations directory (typically `~/.deno/bin` on macOS/Linux) is added to your shell's `PATH`.

## 2. Configure Agent Rules (Methodology)

To enforce the Retrieve-Before-Implement and Store-After-Implement protocol, you must supply the agent with instructions. You can do this at either the project level or globally for all projects.

### Option A: Global Configuration (User Level)
If you want the methodology and skill to be active in every project you open:
1. Append the contents of [AGENTS.md](file:///home/argenkiwi/Code/ambler-ts/zettel/AGENTS.md) to your global configuration rules:
   - File path: `/home/argenkiwi/.gemini/config/AGENTS.md`
2. Copy the `.skills/zettel` folder to your global skills directory:
   - Destination: `/home/argenkiwi/.gemini/config/skills/zettel/`

### Option B: Project-Level Configuration
If you only want this active on specific projects:
1. Append the contents of [AGENTS.md](file:///home/argenkiwi/Code/ambler-ts/zettel/AGENTS.md) to the project's root `AGENTS.md` file.
2. Copy the `.skills/zettel` folder to the project's agent skills directory:
   - Destination: `<project-root>/.agents/skills/zettel/`

---

## 3. Verify Installation

Once installed and configured, navigate to any workspace and test the command:

```bash
# Initialize/Rebuild index from existing Markdown files
zettel reindex

# Search for notes
zettel search "some query"
```
