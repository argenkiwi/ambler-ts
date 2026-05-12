---
name: ambler-util
description: Creates or extracts utility modules into the utils/ directory of an Ambler project. Use this whenever a node's defaultUtils needs external npm/jsr dependencies, contains logic reusable across multiple nodes, or has implementations too complex to inline — even if the user just says "add a util", "extract this helper", "share this function", "create a utility", or "this code is getting too long for the node". When a user creates a node that imports an npm package or has complex async logic, proactively suggest using this skill.
metadata:
  author: leandro
  version: "1.0"
---

# Ambler Util

Follow these steps to create or extract a utility module in the `utils/` directory.

## When to create a utility

Create a `utils/<name>.ts` file when a node's `defaultUtils` contains:

1. **External dependencies** — any `npm:` or `jsr:` import (e.g., `npm:ollama`, `npm:marked`)
2. **Reusable logic** — code that is or could be used by more than one node
3. **Complex implementations** — functions with significant logic (error handling, retries, connection caching, multi-step operations) that clutter the node file

Simple one-liners like `(msg) => console.log(msg)` or `() => Math.random()` belong in `defaultUtils` directly — no need to extract them.

---

## 1. Gather requirements

Before writing, determine:

- **Utility name**: What capability does this module provide? (e.g., `ollama_chat`, `file_writer`, `markdown_parser`). File will be named `utils/<name>.ts`.
- **Functions to export**: What are the signatures? What arguments and return types?
- **Dependencies**: Does it require npm/jsr packages? Which ones and what versions?
- **Nodes that will use it**: Which node(s) will import this utility?

If any of the above is unclear, ask the user before writing code.

---

## 2. Create `utils/<name>.ts`

Export functions that implement the side-effectful work. Keep the module focused on a single capability.

```typescript
// Example: utils/ollama_chat.ts
import { Ollama } from "npm:ollama";

// Stateful resources (connection pools, instances) live here — private.
const instances = new Map<string, Ollama>();

export async function ollamaChat(
  host: string,
  model: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  let ollama = instances.get(host);
  if (!ollama) {
    ollama = new Ollama({ host });
    instances.set(host, ollama);
  }
  const response = await ollama.chat({ model, messages });
  return response.message.content;
}
```

### Rules

- **Export only functions** — never export raw class instances, connection objects, or module-level state. Callers interact through function calls with clear signatures.
- **Keep state private** — if the utility needs to cache a client or pool connections, use a module-level `Map` or variable, but keep it unexported.
- **Match the node's `Utils` type** — exported function signatures must match exactly what the consuming node's `Utils` type declares, so they can be passed in directly.
- **No Ambler imports** — utility files must not import from `"../ambler.ts"`. They are plain TypeScript helpers.
- **Extract URL and config constants** — don't inline magic strings like API base URLs. Pull them into named `const` declarations at the top of the file so they're easy to find and change.

### TSDoc

Every exported function gets a TSDoc comment. This helps both humans reading the code and agents using the utility in future nodes understand what it does without having to trace the implementation.

```typescript
/**
 * Fetches the current temperature for a city from the OpenWeather API.
 *
 * @param city - City name (e.g. "London")
 * @param apiKey - OpenWeather API key
 * @returns Current temperature in Celsius
 */
export async function fetchWeather(city: string, apiKey: string): Promise<number> {
```

Keep it brief — one sentence summary, then `@param` and `@returns` tags. Skip `@throws` unless the function has a documented, meaningful error contract.

---

## 3. Update `deno.json` (if using npm/jsr packages)

If the utility imports from `npm:` or `jsr:`, add the package to the `imports` map in `deno.json`:

```json
{
  "imports": {
    "ollama": "npm:ollama@^0.6.3"
  }
}
```

Use the bare specifier as the import key and the versioned URL as the value. Check `deno.json` first — the package may already be listed.

---

## 4. Connect to the node

Import the utility in the node file and use it in `defaultUtils`. The `Utils` type stays unchanged — only the implementation in `defaultUtils` changes.

```typescript
import { ollamaChat } from "../utils/ollama_chat.ts";

const defaultUtils: Utils = {
  chat: (messages, host, model) => ollamaChat(host, model, messages),
};
```

Tests still inject mock implementations and never touch the utility — that's the point of the `Utils` interface.

---

## 5. Checklist before finishing

- [ ] `utils/<name>.ts` exists and exports the required functions.
- [ ] All npm/jsr packages used are listed in `deno.json`.
- [ ] Exported function signatures match the node's `Utils` type exactly.
- [ ] Stateful resources (instances, caches) are private in the util module.
- [ ] URL/config constants are extracted to named `const` declarations.
- [ ] Every exported function has a TSDoc comment (`@param`, `@returns`).
- [ ] The node's `defaultUtils` delegates to the utility function.
- [ ] No `ambler.ts` imports appear in the utility file.
- [ ] Node tests still use mocked utils — they need no changes.
