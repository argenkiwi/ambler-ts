import { NodeFactory } from "../ambler.ts";
import {
  getAllEmbeddings,
  getAzkMeta,
  searchAzk,
  AzkMeta,
} from "../utils/azk_db.ts";
import {
  cosineSimilarity,
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";
import { DB_PATH } from "../utils/azk_config.ts";

const DEFAULT_LIMIT = 5;

export interface RankedAzk {
  id: string;
  title: string;
  tags: string[];
  created: string;
  score: number;
}

export interface State {
  query: string;
  limit?: number;
  results?: RankedAzk[];
  error?: string;
}

export type Edge = "onFound" | "onEmpty";

export type Utils = {
  searchAzk: (query: string, limit: number) => AzkMeta[];
  embed: (text: string) => Promise<number[] | null>;
  getAllEmbeddings: () => { id: string; vector: number[] }[];
  getAzkMeta: (id: string) => AzkMeta | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  searchAzk: (query, limit) => searchAzk(DB_PATH, query, limit),
  embed: (text) => embedText(text, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_HOST),
  getAllEmbeddings: () => getAllEmbeddings(DB_PATH),
  getAzkMeta: (id) => getAzkMeta(DB_PATH, id),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const limit = state.limit ?? DEFAULT_LIMIT;
    const keywordMatches = utils.searchAzk(state.query, limit);

    const ranked = new Map<string, RankedAzk>(
      keywordMatches.map((note, index) => [
        note.id,
        {
          id: note.id,
          title: note.title,
          tags: note.tags,
          created: note.created,
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
        .map(({ id, vector }) => ({ id, similarity: cosineSimilarity(queryVector, vector) }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      for (const { id, similarity } of semanticMatches) {
        const existing = ranked.get(id);
        if (existing) {
          existing.score += similarity;
        } else {
          const note = utils.getAzkMeta(id);
          if (note) {
            ranked.set(id, {
              id: note.id,
              title: note.title,
              tags: note.tags,
              created: note.created,
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
