import { NodeFactory } from "../ambler.ts";
import { getLinks, AzkLink } from "../utils/azk_db.ts";
import { Note, readNote as fsReadNote } from "../utils/azk_fs.ts";
import { DB_PATH } from "../utils/azk_config.ts";

export interface State {
  id: string;
  result?: Note & { links: AzkLink[] };
  error?: string;
}

export type Edge = "onFound" | "onNotFound";

export type Utils = {
  readNote: (id: string) => Promise<Note | null>;
  getLinks: (id: string) => AzkLink[];
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readNote: (id) => fsReadNote(id),
  getLinks: (id) => getLinks(DB_PATH, id),
  print: (msg) => console.log(msg),
};

/**
 * Reads a note plus every link touching it in either direction. A missing
 * id prints `{ error }` and takes the `onNotFound` edge — the process still
 * exits 0 unless the caller maps that edge to an explicit non-zero exit.
 */
export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const note = await utils.readNote(state.id);

    if (!note) {
      const error = `Azk not found: ${state.id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    const result = { ...note, links: utils.getLinks(state.id) };
    utils.print(JSON.stringify(result));
    return [edges.onFound, { ...state, result }];
  };
