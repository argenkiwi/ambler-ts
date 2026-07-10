import { NodeFactory } from "../ambler.ts";
import {
  createLink as dbCreateLink,
  upsertAzk as dbUpsertAzk,
} from "../utils/azk_db.ts";
import { hashContent, Note, writeNote as fsWriteNote } from "../utils/azk_fs.ts";
import {
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";
import { DB_PATH } from "../utils/azk_config.ts";

export interface AzkLinkInput {
  toId: string;
  relation: string;
}

export interface State {
  title: string;
  body: string;
  tags: string[];
  links?: AzkLinkInput[];
  result?: { id: string; title: string; tags: string[]; created: string; links: AzkLinkInput[] };
  error?: string;
}

export type Edge = "onCreated" | "onError";

export type Utils = {
  generateId: () => string;
  embed: (text: string) => Promise<number[] | null>;
  writeNote: (note: Note) => Promise<void>;
  upsertAzk: (
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
  ) => void;
  createLink: (fromId: string, toId: string, relation: string) => void;
  print: (msg: string) => void;
};

function generateTimestampId(): string {
  return new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
}

const defaultUtils: Utils = {
  generateId: generateTimestampId,
  embed: (text) => embedText(text, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_HOST),
  writeNote: (note) => fsWriteNote(note),
  upsertAzk: (note, embedding) => dbUpsertAzk(DB_PATH, note, embedding),
  createLink: (fromId, toId, relation) => dbCreateLink(DB_PATH, fromId, toId, relation),
  print: (msg) => console.log(msg),
};

/**
 * Writes a new note and its index entry. Note: `links` here is *not*
 * validated against existing ids (unlike the standalone `link` subcommand) —
 * a `toId` that doesn't exist is stored as a dangling link, and `reindex`
 * won't catch it either since it trusts each note's own frontmatter links
 * without checking the target exists.
 *
 * On failure (embed/write/index throw), prints `{ error }` and takes the
 * `onError` edge — the process still exits 0 unless the caller maps that
 * edge to an explicit non-zero exit.
 */
export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const { title, body, tags, links = [] } = state;
    const id = utils.generateId();
    const created = new Date().toISOString();
    const updated = created;

    try {
      const embedding = await utils.embed(body);
      const noteLinks = links.map((link) => ({ to: link.toId, relation: link.relation }));

      await utils.writeNote({ id, title, tags, created, updated, links: noteLinks, body });

      const bodyHash = await hashContent(body);
      utils.upsertAzk(
        { id, title, body, tags, created, updated, bodyHash },
        embedding ?? undefined,
      );

      for (const link of links) {
        utils.createLink(id, link.toId, link.relation);
      }

      const result = { id, title, tags, created, links };
      utils.print(JSON.stringify(result));

      return [edges.onCreated, { ...state, result }];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      utils.print(JSON.stringify({ error: message }));
      return [edges.onError, { ...state, error: message }];
    }
  };
