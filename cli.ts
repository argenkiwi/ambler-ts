#!/usr/bin/env bun
/**
 * Native Ambler CLI for TypeScript / Bun projects adhering to the Ambler Tooling Protocol (ATP).
 *
 * Implements `node`, `walk`, `util`, and `check` without requiring foreign toolchains.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

function toKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_]/g, "-")
    .toLowerCase();
}

function toCamel(s: string): string {
  const parts = toKebab(s).split("-").filter(Boolean);
  if (parts.length === 0) return "";
  return (
    parts[0] +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

function toPascal(s: string): string {
  const c = toCamel(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function toEdge(s: string): string {
  const c = toCamel(s);
  if (c.startsWith("on") && c.length > 2 && c[2] === c[2].toUpperCase()) {
    return c;
  }
  return `on${toPascal(s)}`;
}

async function handleNode(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      outcomes: { type: "string" },
      terminal: { type: "boolean" },
      fallible: { type: "boolean" },
      state: { type: "string", multiple: true },
    },
    allowPositionals: true,
  });

  const rawName = positionals[0];
  if (!rawName) {
    console.error("Error: node name is required");
    process.exit(2);
  }

  const name = toKebab(rawName);
  const nodeFile = join("nodes", `${name}.ts`);
  const testFile = join("nodes", "tests", `${name}.test.ts`);

  if (existsSync(nodeFile)) {
    console.error(`Error: Node already exists at ${nodeFile}`);
    process.exit(1);
  }

  mkdirSync("nodes/tests", { recursive: true });

  const terminal = values.terminal ?? false;
  let edges: string[] = [];
  if (terminal) {
    edges = ["onDone"];
  } else if (values.outcomes) {
    edges = values.outcomes
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)
      .map(toEdge);
  } else {
    console.error("Error: Specify either --outcomes <a,b> or --terminal");
    process.exit(2);
  }

  // Parse state fields: e.g. ["count:number", "name:string"]
  const stateFields: { name: string; type: string }[] = [];
  if (values.state) {
    for (const item of values.state) {
      if (item.includes(":")) {
        const [fn, ft] = item.split(":");
        stateFields.push({ name: toCamel(fn.trim()), type: ft.trim() });
      } else {
        stateFields.push({ name: toCamel(item.trim()), type: "string" });
      }
    }
  }

  // Node file content
  const stateInterface =
    stateFields.length > 0
      ? stateFields.map((f) => `  ${f.name}: ${f.type};`).join("\n")
      : "  // Add state fields as needed\n";

  const edgeUnion = edges.map((e) => `"${e}"`).join(" | ");

  const nodeContent = `import type { NodeFactory } from "../ambler.ts";

export interface State {
${stateInterface}
}

export type Edge = ${edgeUnion};

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  async (state) => {
    throw new Error("not yet implemented");
  };
`;

  writeFileSync(nodeFile, nodeContent);

  // Test file content
  const defaultMockState =
    stateFields.length > 0
      ? stateFields
          .map((f) => {
            const val =
              f.type === "number"
                ? "0"
                : f.type === "boolean"
                  ? "false"
                  : '""';
            return `    ${f.name}: ${val},`;
          })
          .join("\n")
      : "";

  const testCases = edges
    .map(
      (edge) => `test("${toCamel(name)}Node should transition to ${edge}", async () => {
  const initialState: State = {
${defaultMockState}
  };

  const utils: Utils = {
    print: (_msg: string) => {},
  };

  // Replace with expected assertion once implemented
  expect(async () => {
    await factory({ ${edges.map((e) => `${e}: "${e}"`).join(", ")} }, utils)(initialState);
  }).toThrow("not yet implemented");
});`,
    )
    .join("\n\n");

  const testContent = `import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../${name}.ts";

${testCases}
`;

  writeFileSync(testFile, testContent);

  console.log(`Created ${nodeFile}`);
  console.log(`Created ${testFile}`);
}

async function handleWalk(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      nodes: { type: "string" },
      edge: { type: "string", multiple: true },
      "no-runner": { type: "boolean" },
    },
    allowPositionals: true,
  });

  const rawName = positionals[0];
  if (!rawName) {
    console.error("Error: walk name is required");
    process.exit(2);
  }

  const name = toKebab(rawName);
  const walkFile = join("walks", `${name}.ts`);
  const testFile = join("walks", "tests", `${name}.test.ts`);
  const specFile = join("specs", `${name}.md`);

  if (existsSync(walkFile)) {
    console.error(`Error: Walk already exists at ${walkFile}`);
    process.exit(1);
  }

  if (!values.nodes) {
    console.error("Error: --nodes must be provided");
    process.exit(2);
  }

  mkdirSync("walks/tests", { recursive: true });
  mkdirSync("specs", { recursive: true });

  const nodeNames = values.nodes
    .split(",")
    .map((n) => toKebab(n.trim()))
    .filter(Boolean);
  const startNode = nodeNames[0];

  // Parse edge mapping: e.g. ["start.onSuccess=count", "count.onStop=null"]
  const edgeMappings: { fromNode: string; edge: string; toTarget: string }[] =
    [];
  if (values.edge) {
    for (const e of values.edge) {
      if (e.includes("=") && e.includes(".")) {
        const [from, to] = e.split("=");
        const [node, edge] = from.split(".");
        edgeMappings.push({
          fromNode: toKebab(node.trim()),
          edge: toEdge(edge.trim()),
          toTarget: to.trim().toLowerCase() === "null" || to.trim().toLowerCase() === "halt"
            ? "null"
            : `"${toShout(to.trim())}"`,
        });
      }
    }
  }

  function toShout(s: string) {
    return toKebab(s).replace(/-/g, "_").toUpperCase();
  }

  const imports = nodeNames
    .map(
      (n) =>
        `import type { Utils as ${toPascal(n)}Utils } from "../nodes/${n}.ts";\nimport defer * as ${toCamel(n)}Node from "../nodes/${n}.ts";`,
    )
    .join("\n");

  const nodeIds = nodeNames.map((n) => `"${toShout(n)}"`).join(" | ");

  const walkWiring = nodeNames
    .map((n) => {
      const shoutId = toShout(n);
      const matched = edgeMappings.filter((m) => m.fromNode === n);
      const edgeObj =
        matched.length > 0
          ? matched.map((m) => `${m.edge}: ${m.toTarget}`).join(", ")
          : `onDone: null`;
      return `    ${shoutId}: () => ${toCamel(n)}Node.factory({ ${edgeObj} }, utils.${toCamel(n)}),`;
    })
    .join("\n");

  const walkContent = `import { ambler, walk } from "../ambler.ts";
${imports}

export interface State {
  // Shared state
}

export type NodeId = ${nodeIds};

export type WalkUtils = {
${nodeNames.map((n) => `  ${toCamel(n)}?: ${toPascal(n)}Utils;`).join("\n")}
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
${walkWiring}
  });
}

if (import.meta.main) {
  await walk(createWalk(), "${toShout(startNode)}", {});
}
`;

  writeFileSync(walkFile, walkContent);

  if (!existsSync(specFile)) {
    writeFileSync(
      specFile,
      `# ${toPascal(name)} Walk Specification

Initial node: \`${startNode}\`.

## Nodes
${nodeNames.map((n) => `- \`${n}\``).join("\n")}
`,
    );
  }

  const testContent = `import { expect, test } from "bun:test";
import { createWalk } from "../${name}.ts";

test("${toCamel(name)} walk should instantiate cleanly", () => {
  const machine = createWalk();
  expect(machine).toBeDefined();
});
`;

  writeFileSync(testFile, testContent);

  console.log(`Created ${walkFile}`);
  console.log(`Created ${testFile}`);
  console.log(`Created ${specFile}`);
}

async function handleUtil(args: string[]) {
  const { positionals } = parseArgs({
    args,
    allowPositionals: true,
  });

  const rawName = positionals[0];
  if (!rawName) {
    console.error("Error: util name is required");
    process.exit(2);
  }

  const name = toKebab(rawName);
  const utilFile = join("utils", `${name}.ts`);
  mkdirSync("utils", { recursive: true });

  if (existsSync(utilFile)) {
    console.error(`Error: Util already exists at ${utilFile}`);
    process.exit(1);
  }

  const utilContent = `/**
 * Shared utility ${name}.
 */

export interface ${toPascal(name)}Utils {
  // Utility signatures
}

export const default${toPascal(name)}Utils: ${toPascal(name)}Utils = {
  // Production implementation
};
`;

  writeFileSync(utilFile, utilContent);
  console.log(`Created ${utilFile}`);
}

async function handleCheck(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      "lint-only": { type: "boolean" },
    },
    allowPositionals: true,
  });

  const commands: string[][] = [
    ["bun", "run", "check"],
    ["bun", "run", "lint"],
  ];

  if (!values["lint-only"]) {
    commands.push(["bun", "test", "nodes/tests", "walks/tests"]);
  }

  for (const cmd of commands) {
    console.log(`Running ${cmd.join(" ")}...`);
    const proc = Bun.spawnSync(cmd, {
      stdout: "inherit",
      stderr: "inherit",
    });
    if (proc.exitCode !== 0) {
      console.error(`Check failed at step: ${cmd.join(" ")}`);
      process.exit(proc.exitCode ?? 1);
    }
  }

  console.log("All Ambler checks passed.");
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs[0];
  const rest = rawArgs.slice(1);

  switch (command) {
    case "node":
      await handleNode(rest);
      break;
    case "walk":
      await handleWalk(rest);
      break;
    case "util":
      await handleUtil(rest);
      break;
    case "check":
      await handleCheck(rest);
      break;
    case "--help":
    case "-h":
    case undefined:
      console.log(`Usage: bun cli.ts <command> [options]

Commands:
  node <name> (--outcomes <a,b> | --terminal) [--state <fields>]
  walk <name> --nodes <n1,n2> [--edge <e=t>] [--no-runner]
  util <name>
  check [--lint-only]
`);
      process.exit(command ? 0 : 2);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
