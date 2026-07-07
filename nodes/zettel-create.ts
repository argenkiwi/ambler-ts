import { NodeFactory } from "../ambler.ts";
import {
  createLink as dbCreateLink,
  upsertZettel as dbUpsertZettel,
} from "../utils/zettel_db.ts";
import { hashContent, Note, writeNote as fsWriteNote } from "../utils/zettel_fs.ts";
import {
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";
import { DB_PATH } from "../utils/zettel_config.ts";

export interface ZettelLinkInput {
  toId: string;
  relation: string;
}

export interface State {
  title: string;
  body: string;
  tags: string[];
  links?: ZettelLinkInput[];
  result?: { id: string; title: string; tags: string[]; created: string; links: ZettelLinkInput[] };
  error?: string;
}

export type Edge = "onCreated" | "onError";

export type Utils = {
  generateId: () => string;
  embed: (text: string) => Promise<number[] | null>;
  writeNote: (note: Note) => Promise<void>;
  upsertZettel: (
    zettel: {
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
  upsertZettel: (zettel, embedding) => dbUpsertZettel(DB_PATH, zettel, embedding),
  createLink: (fromId, toId, relation) => dbCreateLink(DB_PATH, fromId, toId, relation),
  print: (msg) => console.log(msg),
};

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
      utils.upsertZettel(
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
