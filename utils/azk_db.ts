import { DatabaseSync } from "node:sqlite";

/**
 * A note's indexed metadata. This is a derived cache — the Markdown file
 * under `notes/<id>.md` is the source of truth for `title`/`tags`/body; this
 * table exists purely to make full-text search, semantic re-ranking, and the
 * link graph fast without re-reading every file.
 */
export interface AzkMeta {
  id: string;
  title: string;
  tags: string[];
  created: string;
  updated: string;
  bodyHash: string;
  hasEmbedding: boolean;
}

export interface AzkLink {
  fromId: string;
  toId: string;
  relation: string;
}

const connections = new Map<string, DatabaseSync>();

function open(dbPath: string): DatabaseSync {
  let db = connections.get(dbPath);
  if (!db) {
    const dir = dbPath.slice(0, dbPath.lastIndexOf("/"));
    if (dir) Deno.mkdirSync(dir, { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS azk (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        tags TEXT NOT NULL,
        created TEXT NOT NULL,
        updated TEXT NOT NULL,
        body_hash TEXT NOT NULL,
        embedding BLOB
      );
      CREATE VIRTUAL TABLE IF NOT EXISTS azk_fts USING fts5(
        id UNINDEXED, title, body, tags
      );
      CREATE TABLE IF NOT EXISTS links (
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        relation TEXT NOT NULL,
        created TEXT NOT NULL
      );
    `);
    connections.set(dbPath, db);
  }
  return db;
}

function toMeta(row: Record<string, unknown>): AzkMeta {
  return {
    id: row.id as string,
    title: row.title as string,
    tags: JSON.parse(row.tags as string),
    created: row.created as string,
    updated: row.updated as string,
    bodyHash: row.body_hash as string,
    hasEmbedding: row.embedding !== null,
  };
}

function serializeEmbedding(vector: number[]): Uint8Array {
  return new Uint8Array(new Float32Array(vector).buffer);
}

function deserializeEmbedding(blob: Uint8Array): number[] {
  return Array.from(
    new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4),
  );
}

/**
 * Fetches a single note's indexed metadata by id.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The note's unique id.
 * @returns The metadata, or `null` if the id isn't indexed.
 */
export function getAzkMeta(dbPath: string, id: string): AzkMeta | null {
  const db = open(dbPath);
  const row = db.prepare(`SELECT * FROM azk WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? toMeta(row) : null;
}

/**
 * Inserts or replaces a note's indexed metadata and mirrored FTS5 entry.
 * Used both by the create/update nodes (single note) and by reindex (bulk).
 *
 * If `embedding` is omitted, any previously stored embedding for this id is
 * preserved — callers only pass a fresh embedding when the body actually
 * changed and re-embedding succeeded.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param note - The note's id, title, body (for the FTS mirror only — not
 *   persisted in the metadata table), tags, timestamps, and content hash.
 * @param embedding - A freshly computed embedding vector, if any.
 */
export function upsertAzk(
  dbPath: string,
  note: {
    id: string;
    title: string;
    body: string;
    tags: string[];
    created: string;
    updated: string;
    bodyHash: string;
  },
  embedding?: number[],
): void {
  const db = open(dbPath);
  const tags = JSON.stringify(note.tags);

  const existing = db
    .prepare(`SELECT embedding FROM azk WHERE id = ?`)
    .get(note.id) as { embedding: Uint8Array | null } | undefined;
  const embeddingBlob = embedding
    ? serializeEmbedding(embedding)
    : existing?.embedding ?? null;

  db.prepare(
    `INSERT INTO azk (id, title, tags, created, updated, body_hash, embedding)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title, tags = excluded.tags, created = excluded.created,
       updated = excluded.updated, body_hash = excluded.body_hash, embedding = excluded.embedding`,
  ).run(
    note.id,
    note.title,
    tags,
    note.created,
    note.updated,
    note.bodyHash,
    embeddingBlob,
  );

  db.prepare(`DELETE FROM azk_fts WHERE id = ?`).run(note.id);
  db.prepare(
    `INSERT INTO azk_fts (id, title, body, tags) VALUES (?, ?, ?, ?)`,
  ).run(note.id, note.title, note.body, tags);
}

/**
 * Removes a note's indexed metadata, FTS entry, and any links referencing it.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The note's unique id.
 * @returns `true` if a row was deleted, `false` if the id wasn't indexed.
 */
export function deleteAzk(dbPath: string, id: string): boolean {
  const db = open(dbPath);
  const result = db.prepare(`DELETE FROM azk WHERE id = ?`).run(id);
  db.prepare(`DELETE FROM azk_fts WHERE id = ?`).run(id);
  db.prepare(`DELETE FROM links WHERE from_id = ? OR to_id = ?`).run(id, id);
  return result.changes > 0;
}

/**
 * Removes every indexed note (and its FTS entry and links) whose id isn't
 * in `liveIds` — i.e. its Markdown file no longer exists. Used by reindex to
 * clean up drift after a note file was deleted or moved outside the CLI.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param liveIds - The full set of ids that currently have a note file.
 * @returns The ids that were removed.
 */
export function deleteOrphans(dbPath: string, liveIds: string[]): string[] {
  const live = new Set(liveIds);
  const removed: string[] = [];
  for (const id of listIndexedIds(dbPath)) {
    if (!live.has(id)) {
      deleteAzk(dbPath, id);
      removed.push(id);
    }
  }
  return removed;
}

/**
 * Lists every id currently present in the index.
 *
 * @param dbPath - Path to the SQLite database file.
 */
export function listIndexedIds(dbPath: string): string[] {
  const db = open(dbPath);
  const rows = db.prepare(`SELECT id FROM azk`).all() as { id: string }[];
  return rows.map((row) => row.id);
}

function toMatchQuery(query: string): string {
  const terms = query.split(/\s+/).filter(Boolean);
  return terms.map((term) => `"${term.replace(/"/g, '""')}"`).join(" OR ");
}

/**
 * Ranks azk by FTS5 keyword match against a query string. Terms are OR'd together,
 * so a multi-word natural-language query matches notes containing any of the words,
 * ranked by how many/how well they match.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param query - The search query (matched against title, body, and tags).
 * @param limit - Maximum number of results to return.
 * @returns Matching metadata ordered by FTS5 relevance (best match first).
 */
export function searchAzk(
  dbPath: string,
  query: string,
  limit: number,
): AzkMeta[] {
  const db = open(dbPath);
  const matchQuery = toMatchQuery(query);
  if (!matchQuery) return [];
  const matches = db
    .prepare(
      `SELECT id FROM azk_fts WHERE azk_fts MATCH ? ORDER BY rank LIMIT ?`,
    )
    .all(matchQuery, limit) as { id: string }[];
  const records: AzkMeta[] = [];
  for (const { id } of matches) {
    const record = getAzkMeta(dbPath, id);
    if (record) records.push(record);
  }
  return records;
}

/**
 * Loads every stored embedding, for in-memory cosine-similarity ranking.
 *
 * @param dbPath - Path to the SQLite database file.
 * @returns All azk that have a stored embedding, with their vectors.
 */
export function getAllEmbeddings(
  dbPath: string,
): { id: string; vector: number[] }[] {
  const db = open(dbPath);
  const rows = db
    .prepare(`SELECT id, embedding FROM azk WHERE embedding IS NOT NULL`)
    .all() as { id: string; embedding: Uint8Array }[];
  return rows.map((row) => ({
    id: row.id,
    vector: deserializeEmbedding(row.embedding),
  }));
}

/**
 * Creates an explicit, phrase-carrying link between two azk.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param fromId - The source note's id.
 * @param toId - The target note's id.
 * @param relation - A short phrase explaining why the notes are connected.
 */
export function createLink(
  dbPath: string,
  fromId: string,
  toId: string,
  relation: string,
): void {
  const db = open(dbPath);
  db.prepare(
    `INSERT INTO links (from_id, to_id, relation, created) VALUES (?, ?, ?, ?)`,
  ).run(fromId, toId, relation, new Date().toISOString());
}

/**
 * Replaces every outgoing link recorded for a note with the set from its
 * frontmatter. Used by reindex, where a note's `links` field is authoritative
 * and the index's `links` table must match it exactly (not just append).
 *
 * @param dbPath - Path to the SQLite database file.
 * @param fromId - The source note's id.
 * @param links - The note's current outgoing links.
 */
export function replaceLinksForNote(
  dbPath: string,
  fromId: string,
  links: { to: string; relation: string }[],
): void {
  const db = open(dbPath);
  db.prepare(`DELETE FROM links WHERE from_id = ?`).run(fromId);
  const created = new Date().toISOString();
  for (const link of links) {
    db.prepare(
      `INSERT INTO links (from_id, to_id, relation, created) VALUES (?, ?, ?, ?)`,
    ).run(fromId, link.to, link.relation, created);
  }
}

/**
 * Fetches every link touching a note, in either direction.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The note's unique id.
 * @returns Links where the note is either the source or the target.
 */
export function getLinks(dbPath: string, id: string): AzkLink[] {
  const db = open(dbPath);
  const rows = db
    .prepare(
      `SELECT from_id, to_id, relation FROM links WHERE from_id = ? OR to_id = ?`,
    )
    .all(id, id) as { from_id: string; to_id: string; relation: string }[];
  return rows.map((row) => ({
    fromId: row.from_id,
    toId: row.to_id,
    relation: row.relation,
  }));
}
