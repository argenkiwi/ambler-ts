import { NodeFactory } from "../ambler.ts";
import { getLinks, getZettel, ZettelLink, ZettelRecord } from "../utils/zettel_db.ts";

const DB_PATH = ".zettelkasten/zettel.db";

export interface State {
  id: string;
  result?: ZettelRecord & { links: ZettelLink[] };
  error?: string;
}

export type Edge = "onFound" | "onNotFound";

export type Utils = {
  getZettel: (id: string) => ZettelRecord | null;
  getLinks: (id: string) => ZettelLink[];
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  getZettel: (id) => getZettel(DB_PATH, id),
  getLinks: (id) => getLinks(DB_PATH, id),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  (state) => {
    const zettel = utils.getZettel(state.id);

    if (!zettel) {
      const error = `Zettel not found: ${state.id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    const result = { ...zettel, links: utils.getLinks(state.id) };
    utils.print(JSON.stringify(result));
    return [edges.onFound, { ...state, result }];
  };
