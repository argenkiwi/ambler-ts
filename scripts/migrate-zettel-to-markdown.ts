/**
 * One-time migration: dumps every row out of the old, SQLite-only Zettelkasten
 * schema (id, title, body, tags, created + links) into `notes/*.md` files
 * under the new hybrid Markdown+SQLite format.
 *
 * Run once against a database created before the hybrid model existed:
 *
 *   deno run --allow-read --allow-write scripts/migrate-zettel-to-markdown.ts
 *
 * Afterwards, delete the old index and rebuild it from the new files:
 *
 *   rm -rf .zettelkasten
 *   deno task zettel reindex
 */
import { DatabaseSync } from "node:sqlite";
import { writeNote } from "../utils/zettel_fs.ts";
import { DB_PATH } from "../utils/zettel_config.ts";

interface OldZettelRow {
  id: string;
  title: string;
  body: string;
  tags: string;
  created: string;
}

interface OldLinkRow {
  from_id: string;
  to_id: string;
  relation: string;
}

if (import.meta.main) {
  const db = new DatabaseSync(DB_PATH);

  const zettels = db
    .prepare(`SELECT id, title, body, tags, created FROM zettels`)
    .all() as unknown as OldZettelRow[];
  const links = db
    .prepare(`SELECT from_id, to_id, relation FROM links`)
    .all() as unknown as OldLinkRow[];

  let migrated = 0;
  for (const row of zettels) {
    const outgoingLinks = links
      .filter((link) => link.from_id === row.id)
      .map((link) => ({ to: link.to_id, relation: link.relation }));

    await writeNote({
      id: row.id,
      title: row.title,
      tags: JSON.parse(row.tags),
      created: row.created,
      updated: row.created,
      links: outgoingLinks,
      body: row.body,
    });
    migrated++;
  }

  console.log(JSON.stringify({ migrated }));
  console.log(
    "Next steps:\n" +
      `  1. rm -rf ${DB_PATH.slice(0, DB_PATH.lastIndexOf("/"))}\n` +
      "  2. deno task zettel reindex\n" +
      "  3. Spot-check a few notes with: deno task zettel get <id>",
  );
}
