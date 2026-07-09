import { NodeFactory } from "../ambler.ts";
import {
  deleteOrphans as dbDeleteOrphans,
  getAzkMeta as dbGetAzkMeta,
  replaceLinksForNote as dbReplaceLinksForNote,
  upsertAzk as dbUpsertAzk,
} from "../utils/azk_db.ts";
import {
  hashContent,
  listNoteIds as fsListNoteIds,
  Note,
  readNote as fsReadNote,
} from "../utils/azk_fs.ts";
import {
  DEFAULT_EMBEDDING_HOST,
  DEFAULT_EMBEDDING_MODEL,
  embed as embedText,
} from "../utils/embeddings.ts";
import { DB_PATH } from "../utils/azk_config.ts";

export interface State {
  result?: { indexed: number; updated: number; removed: number; total: number };
  error?: string;
}

export type Edge = "onIndexed";

export type Utils = {
  listNoteIds: () => Promise<string[]>;
  readNote: (id: string) => Promise<Note | null>;
  getAzkMeta: (id: string) => { bodyHash: string } | null;
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
  replaceLinksForNote: (fromId: string, links: { to: string; relation: string }[]) => void;
  deleteOrphans: (liveIds: string[]) => string[];
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  listNoteIds: () => fsListNoteIds(),
  readNote: (id) => fsReadNote(id),
  getAzkMeta: (id) => dbGetAzkMeta(DB_PATH, id),
  embed: (text) => embedText(text, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_HOST),
  upsertAzk: (note, embedding) => dbUpsertAzk(DB_PATH, note, embedding),
  replaceLinksForNote: (fromId, links) => dbReplaceLinksForNote(DB_PATH, fromId, links),
  deleteOrphans: (liveIds) => dbDeleteOrphans(DB_PATH, liveIds),
  print: (msg) => console.log(msg),
};

/**
 * Rebuilds the SQLite index (`azk`, `azk_fts`, `links`) from the
 * Markdown files under `notes/`, which are the source of truth. Safe to run
 * at any time — e.g. after a fresh clone (the index is gitignored), after
 * hand-editing a note outside the CLI, or to repair drift.
 */
export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const ids = await utils.listNoteIds();
    let indexed = 0;
    let updated = 0;

    for (const id of ids) {
      const note = await utils.readNote(id);
      if (!note) continue;

      const bodyHash = await hashContent(note.body);
      const existing = utils.getAzkMeta(id);
      const changed = !existing || existing.bodyHash !== bodyHash;

      const embedding = changed ? await utils.embed(note.body) : null;

      utils.upsertAzk(
        {
          id: note.id,
          title: note.title,
          body: note.body,
          tags: note.tags,
          created: note.created,
          updated: note.updated,
          bodyHash,
        },
        embedding ?? undefined,
      );

      utils.replaceLinksForNote(id, note.links);

      if (!existing) indexed++;
      else if (changed) updated++;
    }

    const removed = utils.deleteOrphans(ids).length;

    const result = { indexed, updated, removed, total: ids.length };
    utils.print(JSON.stringify(result));
    return [edges.onIndexed, { ...state, result }];
  };
