# AGENTS.md

Ambler is a Deno/TypeScript state-machine framework: programs are executable graphs of atomic `nodes/` (factories with injected `Utils`) wired together in `walks/`, documented up front in `specs/`. See `README.md` for the full architecture and the developer workflow (Specify → Implement → Test → Compose → Execute). The `.agents/skills/` directory has one skill per step of that workflow (`ambler-spec`, `ambler-node`, `ambler-test`, `ambler-walk`, `ambler-util`, `ambler-init`).

## Zettelkasten RAG Protocol

This project has a Zettelkasten — an atomic, explicitly-linked note store — at `.zettelkasten/zettel.db` (SQLite, with full-text search built in and optional semantic embeddings). It exists so design decisions and gotchas compound across sessions instead of being re-discovered every time. Use it via the `zettel` deno task below; do not read or write `.zettelkasten/zettel.db` directly.

**Before implementing any non-trivial prompt:**

```bash
deno task zettel search "<short summary of the task>"
```

Read the returned notes before writing code. If a note is directly relevant, treat it as prior art — don't rediscover a decision that's already been made (or, if you disagree with it, say so and update it).

**After completing the work:**

```bash
echo '{"title":"<short title>","body":"<what you decided or learned, and why>","tags":["<tag>"],"links":[{"toId":"<id>","relation":"<short phrase>"}]}' | deno task zettel create
```

Capture the *non-obvious* part — a decision, a constraint, a gotcha — not a restatement of the diff. One idea per note. If it builds on or contradicts a note found during search, include it in `links` with a short relation phrase (e.g. "builds on", "supersedes").

**When existing guidance turns out stale or wrong:**

```bash
echo '{"title":"..."}' | deno task zettel update <id>   # partial {title?,body?,tags?} via stdin
deno task zettel delete <id>
```

Prefer updating over leaving a contradicting note next to the old one.

**To connect two existing notes explicitly** (the deliberate-linking step, independent of creation-time links):

```bash
deno task zettel link <fromId> <toId> "<relation phrase>"
```

**To fetch one note and its links:**

```bash
deno task zettel get <id>
```

All six subcommands print a single JSON object/array to stdout — parse it directly. Search blends keyword (FTS5) and, when a local OpenAI-compatible embeddings host is reachable (default `http://localhost:11434/v1`, model `nomic-embed-text`), semantic similarity — it degrades gracefully to keyword-only if no such host is running.
