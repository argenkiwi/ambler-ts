import { NodeFactory } from "../ambler.ts";
import {
  createLink as dbCreateLink,
  createZettel as dbCreateZettel,
} from "../utils/zettel_db.ts";
import {
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";

const DB_PATH = ".zettelkasten/zettel.db";

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
  createZettel: (
    zettel: { id: string; title: string; body: string; tags: string[]; created: string },
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
  createZettel: (zettel, embedding) => dbCreateZettel(DB_PATH, zettel, embedding),
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

    try {
      const embedding = await utils.embed(body);
      utils.createZettel(
        { id, title, body, tags, created },
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
