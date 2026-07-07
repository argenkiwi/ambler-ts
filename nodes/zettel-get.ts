import { NodeFactory } from "../ambler.ts";
import { getLinks, ZettelLink } from "../utils/zettel_db.ts";
import { Note, readNote as fsReadNote } from "../utils/zettel_fs.ts";
import { DB_PATH } from "../utils/zettel_config.ts";

export interface State {
  id: string;
  result?: Note & { links: ZettelLink[] };
  error?: string;
}

export type Edge = "onFound" | "onNotFound";

export type Utils = {
  readNote: (id: string) => Promise<Note | null>;
  getLinks: (id: string) => ZettelLink[];
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readNote: (id) => fsReadNote(id),
  getLinks: (id) => getLinks(DB_PATH, id),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const note = await utils.readNote(state.id);

    if (!note) {
      const error = `Zettel not found: ${state.id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    const result = { ...note, links: utils.getLinks(state.id) };
    utils.print(JSON.stringify(result));
    return [edges.onFound, { ...state, result }];
  };
