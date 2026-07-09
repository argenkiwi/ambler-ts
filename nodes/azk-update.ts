import { NodeFactory } from "../ambler.ts";
import { upsertAzk as dbUpsertAzk } from "../utils/azk_db.ts";
import {
  hashContent,
  Note,
  readNote as fsReadNote,
  writeNote as fsWriteNote,
} from "../utils/azk_fs.ts";
import {
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";
import { DB_PATH } from "../utils/azk_config.ts";

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
  readNote: (id: string) => Promise<Note | null>;
  writeNote: (note: Note) => Promise<void>;
  embed: (text: string) => Promise<number[] | null>;
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
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readNote: (id) => fsReadNote(id),
  writeNote: (note) => fsWriteNote(note),
  embed: (text) => embedText(text, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_HOST),
  upsertAzk: (note, embedding) => dbUpsertAzk(DB_PATH, note, embedding),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const { id, title, body, tags } = state;
    const existing = await utils.readNote(id);

    if (!existing) {
      const error = `Azk not found: ${id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    const updatedNote: Note = {
      ...existing,
      title: title ?? existing.title,
      body: body ?? existing.body,
      tags: tags ?? existing.tags,
      updated: new Date().toISOString(),
    };

    const embedding = body ? await utils.embed(body) : null;

    await utils.writeNote(updatedNote);

    const bodyHash = await hashContent(updatedNote.body);
    utils.upsertAzk(
      {
        id,
        title: updatedNote.title,
        body: updatedNote.body,
        tags: updatedNote.tags,
        created: updatedNote.created,
        updated: updatedNote.updated,
        bodyHash,
      },
      embedding ?? undefined,
    );

    const result = { id, updated: true as const };
    utils.print(JSON.stringify(result));
    return [edges.onUpdated, { ...state, result }];
  };
