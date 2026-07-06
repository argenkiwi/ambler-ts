import { NodeFactory } from "../ambler.ts";
import { updateZettel as dbUpdateZettel } from "../utils/zettel_db.ts";
import {
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";

const DB_PATH = ".zettelkasten/zettel.db";

export interface State {
  id: string;
  title?: string;
  body?: string;
  tags?: string[];
  result?: { id: string; updated: true };
  error?: string;
}

export type Edge = "onUpdated" | "onNotFound";

export type Utils = {
  embed: (text: string) => Promise<number[] | null>;
  updateZettel: (
    id: string,
    fields: { title?: string; body?: string; tags?: string[] },
    embedding?: number[],
  ) => boolean;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  embed: (text) => embedText(text, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_HOST),
  updateZettel: (id, fields, embedding) => dbUpdateZettel(DB_PATH, id, fields, embedding),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const { id, title, body, tags } = state;
    const embedding = body ? await utils.embed(body) : null;

    const updated = utils.updateZettel(
      id,
      { title, body, tags },
      embedding ?? undefined,
    );

    if (!updated) {
      const error = `Zettel not found: ${id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    const result = { id, updated: true as const };
    utils.print(JSON.stringify(result));
    return [edges.onUpdated, { ...state, result }];
  };
