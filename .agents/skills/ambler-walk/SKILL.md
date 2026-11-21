---
name: ambler-walk
description: Creates a complete Ambler walk — the TypeScript wiring file (walks/<name>.ts) and the Markdown spec (specs/<name>.md) — and ensures all required nodes exist. Use this whenever a user wants to add a new program or flow to an Ambler project, even if they say "new walk", "add a program", "wire up these nodes", or just describe what they want the app to do.
metadata:
  author: leandro
  version: "3.0"
---

# Ambler Walk

This skill guides you in creating a complete Ambler walk. A walk is a state-machine program consisting of two files:

1. `walks/<name>.ts` — TypeScript file defining the shared `State`, `initialState`, and the wired node graph.
2. `specs/<name>.md` — Markdown specification describing the shared state and the logic/transitions of each step.

---

## Step 1 — Identify the Walk

- Determine the walk name (lowercase, hyphen-separated, e.g. `my-walk`). The file will be `walks/<name>.ts`.
- Clarify the walk's purpose: what program does it implement?
- Identify the nodes (steps) required and their transitions.

---

## Step 2 — Research and Reuse

Before creating new nodes, research existing ones to promote reuse and consistency:

- **Review Existing Specs:** Browse `specs/*.md` to identify nodes that already implement the required logic (e.g., "Ollama Check", "Model Select"). This is more efficient than reading source code and helps maintain architectural alignment.
- **Check Node Implementation:** For each node identified, verify its existence in `nodes/<nodeName>.ts`.

---

## Step 3 — Create the Specification File (`specs/<name>.md`)

Create the Markdown spec using the `/ambler-spec` skill. This acts as the **blueprint** for the entire walk, defining the shared state and the logic for every node.

---

## Step 4 — Ensure Nodes Exist

For each node defined in the specification:

- If it does **not** exist in `nodes/<nodeName>.ts`, create it using the `/ambler-node` skill. This runs a full TDD pass — skeleton, tests (red), implementation, tests (green) — before completing. No separate test step is needed.
- If the node already exists but has no tests, use the `/ambler-test` skill to retrofit coverage.

---

## Step 5 — Create the Wiring File (`walks/<name>.ts`)

```typescript
import { ambler, walk } from "../ambler.ts";
import defer * as startNode from "../nodes/start.ts";
import defer * as nextNode from "../nodes/next.ts";
import defer * as stopNode from "../nodes/stop.ts";
import type { Utils as StartUtils } from "../nodes/start.ts";
import type { Utils as NextUtils } from "../nodes/next.ts";
import type { Utils as StopUtils } from "../nodes/stop.ts";

export interface State {
  field: string;
  error?: string;
}

export type NodeId = "START" | "NEXT" | "STOP";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  start?: StartUtils;
  next?: NextUtils;
  stop?: StopUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    START: () =>
      startNode.factory({ onSuccess: "NEXT", onError: "START" }, utils.start),
    NEXT: () => nextNode.factory({ onComplete: "STOP" }, utils.next),
    STOP: () => stopNode.factory({ onDone: null }, utils.stop),
  });
}

if (import.meta.main) {
  const final = await walk(createWalk(), "START", { field: "initial" });
  if (final.error) process.exit(1);
}
```

**Key rules:**
- Import `ambler` and `walk` from `../ambler.ts`. Never hand-write the run loop: `walk()` runs it, returns the final state, and wraps any thrown error in a `WalkError` that names the failing node.
- Use `import defer * as <alias>` for every node to support lazy loading (Bun 1.4+; type-checks with TypeScript 7+). Utils types come in through separate `import type` lines, which are erased at runtime and don't defeat the deferral.
- Export `State`, `NodeId`, `WalkUtils` and `createWalk(utils)` so the wiring can be tested (Step 6).
- Use arrow functions to defer node creation: `START: () => startNode.factory({ ... }, utils.start)`.
- Every edge in a factory's record is required, so an unwired edge is a type error. Wire a terminal edge with `null`.
- If a failure ends the walk through an `error` state field, exit with `process.exit(1)` so shell callers see a non-zero status.
- To reuse one generic node under several IDs with different configuration (e.g. two yes/no prompts), pass construction options as the factory's third argument: `confirmNode.factory(edges, utils.confirm, { question: "Proceed?" })`.

---

## Step 6 — Test the Wiring (`walks/tests/<name>.test.ts`)

Node tests check each node on its own. A wiring test checks that the edges connect the nodes into the program the spec describes. Drive the whole walk through `createWalk` with one scripted set of mocked utils (inputs played back from an array, output recorded), then assert the final state and everything printed:

```typescript
import { expect, test } from "bun:test";
import { walk } from "../../ambler.ts";
import { createWalk } from "../<name>.ts";

test("<name> retries invalid input, then finishes", async () => {
  const lines = ["bad", "good"];
  const printed: string[] = [];
  const print = (msg: string) => {
    printed.push(msg);
  };

  const final = await walk(
    createWalk({
      start: { readLine: () => lines.shift() ?? null, print },
      stop: { print },
    }),
    "START",
    { field: "initial" },
  );

  expect(final.field).toEqual("good");
  expect(printed).toEqual(["Error: ...", "Done."]);
});
```

Cover at least the main path, plus every path that loops back or ends early (error edges, end of input). See `walks/tests/counter.test.ts` and `walks/tests/chat.test.ts` for examples.

---

## Step 7 — Add a Script

Add (or update) an entry in `package.json` under `scripts` for this walk:

```json
"<name>": "bun walks/<name>.ts"
```

Bun has no permission flags: a walk can read, write and use the network without opting in. So keep side effects behind each node's `Utils`, where tests can mock them and reviewers can see them.

Users pass arguments after the script name: `bun run <name> <arg1> <arg2>`

---

## Step 8 — Verify

Run the checks and tests, then run the walk to confirm it behaves as specified:

```
bun run check && bun run lint && bun run test
bun run <name>
```

---

## Checklist

Before finishing, confirm:

- [ ] `specs/<name>.md` exists and matches the node names in the `.ts` file.
- [ ] `walks/<name>.ts` exports `State`, `NodeId`, `WalkUtils` and `createWalk`, and runs through `walk()`.
- [ ] Every node used in the walk has a corresponding `nodes/<nodeName>.ts` and passing tests (enforced by `/ambler-node`).
- [ ] `walks/tests/<name>.test.ts` covers the main path and every loop or early exit.
- [ ] All tests pass (`bun run test`).
- [ ] `package.json` has a script for `<name>`.
- [ ] The walk runs end-to-end without errors.
