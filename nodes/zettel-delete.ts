import { NodeFactory } from "../ambler.ts";
import { deleteZettel as dbDeleteZettel } from "../utils/zettel_db.ts";
import { deleteNoteFile as fsDeleteNoteFile, Note, readNote as fsReadNote } from "../utils/zettel_fs.ts";
import { DB_PATH } from "../utils/zettel_config.ts";

export interface State {
  id: string;
  result?: { id: string; deleted: true };
  error?: string;
}

export type Edge = "onDeleted" | "onNotFound";

export type Utils = {
  readNote: (id: string) => Promise<Note | null>;
  deleteNoteFile: (id: string) => Promise<void>;
  deleteZettel: (id: string) => boolean;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readNote: (id) => fsReadNote(id),
  deleteNoteFile: (id) => fsDeleteNoteFile(id),
  deleteZettel: (id) => dbDeleteZettel(DB_PATH, id),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const existing = await utils.readNote(state.id);

    if (!existing) {
      const error = `Zettel not found: ${state.id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    await utils.deleteNoteFile(state.id);
    utils.deleteZettel(state.id);

    const result = { id: state.id, deleted: true as const };
    utils.print(JSON.stringify(result));
    return [edges.onDeleted, { ...state, result }];
  };
