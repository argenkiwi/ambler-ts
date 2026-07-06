import { DatabaseSync } from "node:sqlite";

export interface ZettelRecord {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created: string;
  hasEmbedding: boolean;
}

export interface ZettelLink {
  fromId: string;
  toId: string;
  relation: string;
}

const connections = new Map<string, DatabaseSync>();

function open(dbPath: string): DatabaseSync {
  let db = connections.get(dbPath);
  if (!db) {
    db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS zettels (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        tags TEXT NOT NULL,
        created TEXT NOT NULL,
        embedding BLOB
      );
      CREATE VIRTUAL TABLE IF NOT EXISTS zettels_fts USING fts5(
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

function toRecord(row: Record<string, unknown>): ZettelRecord {
  return {
    id: row.id as string,
    title: row.title as string,
    body: row.body as string,
    tags: JSON.parse(row.tags as string),
    created: row.created as string,
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
 * Creates a new zettel row and its mirrored FTS5 entry.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param zettel - The note's id, title, body, tags, and creation timestamp.
 * @param embedding - Optional embedding vector; omitted when no embeddings host was reachable.
 */
export function createZettel(
  dbPath: string,
  zettel: { id: string; title: string; body: string; tags: string[]; created: string },
  embedding?: number[],
): void {
  const db = open(dbPath);
  const tags = JSON.stringify(zettel.tags);
  db.prepare(
    `INSERT INTO zettels (id, title, body, tags, created, embedding) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    zettel.id,
    zettel.title,
    zettel.body,
    tags,
    zettel.created,
    embedding ? serializeEmbedding(embedding) : null,
  );
  db.prepare(
    `INSERT INTO zettels_fts (id, title, body, tags) VALUES (?, ?, ?, ?)`,
  ).run(zettel.id, zettel.title, zettel.body, tags);
}

/**
 * Fetches a single zettel by id.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The zettel's unique id.
 * @returns The record, or `null` if no zettel with that id exists.
 */
export function getZettel(dbPath: string, id: string): ZettelRecord | null {
  const db = open(dbPath);
  const row = db.prepare(`SELECT * FROM zettels WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? toRecord(row) : null;
}

/**
 * Updates the title, body, and/or tags of an existing zettel, keeping the FTS index in sync.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The zettel's unique id.
 * @param fields - Partial fields to update.
 * @param embedding - New embedding to store; only pass when `body` changed and re-embedding succeeded.
 * @returns `true` if a row was updated, `false` if no zettel with that id exists.
 */
export function updateZettel(
  dbPath: string,
  id: string,
  fields: { title?: string; body?: string; tags?: string[] },
  embedding?: number[],
): boolean {
  const db = open(dbPath);
  const existing = getZettel(dbPath, id);
  if (!existing) return false;

  const title = fields.title ?? existing.title;
  const body = fields.body ?? existing.body;
  const tags = fields.tags ?? existing.tags;
  const tagsJson = JSON.stringify(tags);

  if (embedding) {
    db.prepare(
      `UPDATE zettels SET title = ?, body = ?, tags = ?, embedding = ? WHERE id = ?`,
    ).run(title, body, tagsJson, serializeEmbedding(embedding), id);
  } else {
    db.prepare(
      `UPDATE zettels SET title = ?, body = ?, tags = ? WHERE id = ?`,
    ).run(title, body, tagsJson, id);
  }
  db.prepare(
    `UPDATE zettels_fts SET title = ?, body = ?, tags = ? WHERE id = ?`,
  ).run(title, body, tagsJson, id);
  return true;
}

/**
 * Deletes a zettel, its FTS entry, and any links referencing it.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The zettel's unique id.
 * @returns `true` if a row was deleted, `false` if no zettel with that id exists.
 */
export function deleteZettel(dbPath: string, id: string): boolean {
  const db = open(dbPath);
  const result = db.prepare(`DELETE FROM zettels WHERE id = ?`).run(id);
  db.prepare(`DELETE FROM zettels_fts WHERE id = ?`).run(id);
  db.prepare(`DELETE FROM links WHERE from_id = ? OR to_id = ?`).run(id, id);
  return result.changes > 0;
}

function toMatchQuery(query: string): string {
  const terms = query.split(/\s+/).filter(Boolean);
  return terms.map((term) => `"${term.replace(/"/g, '""')}"`).join(" OR ");
}

/**
 * Ranks zettels by FTS5 keyword match against a query string. Terms are OR'd together,
 * so a multi-word natural-language query matches notes containing any of the words,
 * ranked by how many/how well they match.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param query - The search query (matched against title, body, and tags).
 * @param limit - Maximum number of results to return.
 * @returns Matching records ordered by FTS5 relevance (best match first).
 */
export function searchZettels(
  dbPath: string,
  query: string,
  limit: number,
): ZettelRecord[] {
  const db = open(dbPath);
  const matchQuery = toMatchQuery(query);
  if (!matchQuery) return [];
  const matches = db
    .prepare(
      `SELECT id FROM zettels_fts WHERE zettels_fts MATCH ? ORDER BY rank LIMIT ?`,
    )
    .all(matchQuery, limit) as { id: string }[];
  const records: ZettelRecord[] = [];
  for (const { id } of matches) {
    const record = getZettel(dbPath, id);
    if (record) records.push(record);
  }
  return records;
}

/**
 * Stores or replaces the embedding vector for a zettel.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The zettel's unique id.
 * @param vector - The embedding vector to store.
 */
export function setEmbedding(dbPath: string, id: string, vector: number[]): void {
  const db = open(dbPath);
  db.prepare(`UPDATE zettels SET embedding = ? WHERE id = ?`).run(
    serializeEmbedding(vector),
    id,
  );
}

/**
 * Loads every stored embedding, for in-memory cosine-similarity ranking.
 *
 * @param dbPath - Path to the SQLite database file.
 * @returns All zettels that have a stored embedding, with their vectors.
 */
export function getAllEmbeddings(
  dbPath: string,
): { id: string; vector: number[] }[] {
  const db = open(dbPath);
  const rows = db
    .prepare(`SELECT id, embedding FROM zettels WHERE embedding IS NOT NULL`)
    .all() as { id: string; embedding: Uint8Array }[];
  return rows.map((row) => ({
    id: row.id,
    vector: deserializeEmbedding(row.embedding),
  }));
}

/**
 * Creates an explicit, phrase-carrying link between two zettels.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param fromId - The source zettel's id.
 * @param toId - The target zettel's id.
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
 * Fetches every link touching a zettel, in either direction.
 *
 * @param dbPath - Path to the SQLite database file.
 * @param id - The zettel's unique id.
 * @returns Links where the zettel is either the source or the target.
 */
export function getLinks(dbPath: string, id: string): ZettelLink[] {
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
