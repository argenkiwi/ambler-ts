import { NodeFactory } from "../ambler.ts";
import {
  getAllEmbeddings,
  getZettelMeta,
  searchZettels,
  ZettelMeta,
} from "../utils/zettel_db.ts";
import {
  cosineSimilarity,
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";
import { DB_PATH } from "../utils/zettel_config.ts";

const DEFAULT_LIMIT = 5;

export interface RankedZettel {
  id: string;
  title: string;
  tags: string[];
  created: string;
  score: number;
}

export interface State {
  query: string;
  limit?: number;
  results?: RankedZettel[];
  error?: string;
}

export type Edge = "onFound" | "onEmpty";

export type Utils = {
  searchZettels: (query: string, limit: number) => ZettelMeta[];
  embed: (text: string) => Promise<number[] | null>;
  getAllEmbeddings: () => { id: string; vector: number[] }[];
  getZettelMeta: (id: string) => ZettelMeta | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  searchZettels: (query, limit) => searchZettels(DB_PATH, query, limit),
  embed: (text) =>
    embedText(text, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_HOST),
  getAllEmbeddings: () => getAllEmbeddings(DB_PATH),
  getZettelMeta: (id) => getZettelMeta(DB_PATH, id),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const limit = state.limit ?? DEFAULT_LIMIT;
  const keywordMatches = utils.searchZettels(state.query, limit);

  const ranked = new Map<string, RankedZettel>(
    keywordMatches.map((zettel, index) => [
      zettel.id,
      {
        id: zettel.id,
        title: zettel.title,
        tags: zettel.tags,
        created: zettel.created,
        score: keywordMatches.length - index,
      },
    ]),
  );

  // Semantic search is additive: it can both boost keyword hits and surface
  // conceptually related notes that share no keywords with the query.
  const queryVector = await utils.embed(state.query);
  if (queryVector) {
    const semanticMatches = utils
      .getAllEmbeddings()
      .map(({ id, vector }) => ({
        id,
        similarity: cosineSimilarity(queryVector, vector),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    for (const { id, similarity } of semanticMatches) {
      const existing = ranked.get(id);
      if (existing) {
        existing.score += similarity;
      } else {
        const zettel = utils.getZettelMeta(id);
        if (zettel) {
          ranked.set(id, {
            id: zettel.id,
            title: zettel.title,
            tags: zettel.tags,
            created: zettel.created,
            score: similarity,
          });
        }
      }
    }
  }

  const results = Array.from(ranked.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (results.length === 0) {
    utils.print(JSON.stringify([]));
    return [edges.onEmpty, { ...state, results }];
  }

  utils.print(JSON.stringify(results));
  return [edges.onFound, { ...state, results }];
};
