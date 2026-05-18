/**
 * Regenerates nodes/NODES.md by scanning nodes/*.ts for @category metadata blocks.
 * Run with: deno task index-nodes
 */

interface NodeMeta {
  name: string;
  description: string;
  category: string;
  standalone: string;
  reads: string;
  writes: string;
  edges: string;
  utils: string;
}

async function parseNodeFile(filePath: string): Promise<NodeMeta | null> {
  const content = await Deno.readTextFile(filePath);
  const jsdocMatch = content.match(/^\/\*\*([\s\S]*?)\*\//);
  if (!jsdocMatch) return null;

  const jsdoc = jsdocMatch[1];
  if (!jsdoc.includes("@category")) return null;

  const lines = jsdoc
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd());

  const description = lines.find(
    (l) => l.trim() !== "" && !l.startsWith("@"),
  ) ?? "";

  const tags: Record<string, string[]> = {};
  let currentTag: string | null = null;

  for (const line of lines) {
    const tagMatch = line.match(/^@(\w+)\s*(.*)/);
    if (tagMatch) {
      currentTag = tagMatch[1];
      tags[currentTag] = [tagMatch[2].trim()];
    } else if (line.trim() !== "") {
      if (currentTag !== null) {
        tags[currentTag].push(line.trim());
      }
    }
  }

  const name = filePath.split("/").pop()!.replace(".ts", "");

  return {
    name,
    description,
    category: tags.category?.[0] ?? "—",
    standalone: tags.standalone?.[0] ?? "—",
    reads: tags.reads?.[0] ?? "—",
    writes: tags.writes?.[0] ?? "—",
    edges: formatEdges(tags.edges ?? []),
    utils: formatUtils(tags.utils ?? []),
  };
}

function formatEdges(lines: string[]): string {
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) return "—";
  return lines.map((line) => {
    const parts = line.split(" — ");
    if (parts.length >= 2) {
      return `${parts[0].trim()} (${parts.slice(1).join(" — ").trim()})`;
    }
    return line.trim();
  }).filter(Boolean).join(", ");
}

function formatUtils(lines: string[]): string {
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) return "—";
  return lines.map((line) => line.split("(")[0].split(" ")[0].trim())
    .filter(Boolean)
    .join(", ");
}

function renderEntry(meta: NodeMeta): string {
  const row =
    `**${meta.name}** | ${meta.category} | ${meta.standalone} | ${meta.reads} | ${meta.writes} | ${meta.edges} | ${meta.utils}`;
  return `${row}\n> ${meta.description}`;
}

const nodesDir = new URL("../nodes", import.meta.url).pathname;
const outputPath = `${nodesDir}/NODES.md`;

const entries: NodeMeta[] = [];

for await (const entry of Deno.readDir(nodesDir)) {
  if (!entry.isFile || !entry.name.endsWith(".ts")) continue;
  const meta = await parseNodeFile(`${nodesDir}/${entry.name}`);
  if (meta) entries.push(meta);
}

entries.sort((a, b) =>
  a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
);

const header = `# Node Index

Columns: **name** | category | standalone | reads | writes | edges | utils
Regenerate with: \`deno task index-nodes\`

---
`;

const body = entries.map(renderEntry).join("\n\n");
await Deno.writeTextFile(outputPath, `${header}\n${body}\n`);

console.log(`Wrote ${entries.length} entries to nodes/NODES.md`);
