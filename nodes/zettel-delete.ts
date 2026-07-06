import { NodeFactory } from "../ambler.ts";
import { deleteZettel as dbDeleteZettel } from "../utils/zettel_db.ts";

const DB_PATH = ".zettelkasten/zettel.db";

export interface State {
  id: string;
  result?: { id: string; deleted: true };
  error?: string;
}

export type Edge = "onDeleted" | "onNotFound";

export type Utils = {
  deleteZettel: (id: string) => boolean;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  deleteZettel: (id) => dbDeleteZettel(DB_PATH, id),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  (state) => {
    const deleted = utils.deleteZettel(state.id);

    if (!deleted) {
      const error = `Zettel not found: ${state.id}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onNotFound, { ...state, error }];
    }

    const result = { id: state.id, deleted: true as const };
    utils.print(JSON.stringify(result));
    return [edges.onDeleted, { ...state, result }];
  };
