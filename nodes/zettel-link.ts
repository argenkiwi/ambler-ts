import { NodeFactory } from "../ambler.ts";
import { createLink as dbCreateLink, getZettel } from "../utils/zettel_db.ts";

const DB_PATH = ".zettelkasten/zettel.db";

export interface State {
  fromId: string;
  toId: string;
  relation: string;
  result?: { fromId: string; toId: string; relation: string; linked: true };
  error?: string;
}

export type Edge = "onLinked" | "onError";

export type Utils = {
  getZettel: (id: string) => { id: string } | null;
  createLink: (fromId: string, toId: string, relation: string) => void;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  getZettel: (id) => getZettel(DB_PATH, id),
  createLink: (fromId, toId, relation) => dbCreateLink(DB_PATH, fromId, toId, relation),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  (state) => {
    const { fromId, toId, relation } = state;

    if (!utils.getZettel(fromId) || !utils.getZettel(toId)) {
      const error = `Cannot link: one or both zettels not found (${fromId}, ${toId})`;
      utils.print(JSON.stringify({ error }));
      return [edges.onError, { ...state, error }];
    }

    utils.createLink(fromId, toId, relation);

    const result = { fromId, toId, relation, linked: true as const };
    utils.print(JSON.stringify(result));
    return [edges.onLinked, { ...state, result }];
  };
