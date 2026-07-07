import { NodeFactory } from "../ambler.ts";
import { createLink as dbCreateLink } from "../utils/zettel_db.ts";
import {
  Note,
  readNote as fsReadNote,
  writeNote as fsWriteNote,
} from "../utils/zettel_fs.ts";
import { DB_PATH } from "../utils/zettel_config.ts";

export interface State {
  fromId: string;
  toId: string;
  relation: string;
  result?: { fromId: string; toId: string; relation: string; linked: true };
  error?: string;
}

export type Edge = "onLinked" | "onError";

export type Utils = {
  readNote: (id: string) => Promise<Note | null>;
  writeNote: (note: Note) => Promise<void>;
  createLink: (fromId: string, toId: string, relation: string) => void;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readNote: (id) => fsReadNote(id),
  writeNote: (note) => fsWriteNote(note),
  createLink: (fromId, toId, relation) =>
    dbCreateLink(DB_PATH, fromId, toId, relation),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const { fromId, toId, relation } = state;

  const [fromNote, toNote] = await Promise.all([
    utils.readNote(fromId),
    utils.readNote(toId),
  ]);

  if (!fromNote || !toNote) {
    const error =
      `Cannot link: one or both zettels not found (${fromId}, ${toId})`;
    utils.print(JSON.stringify({ error }));
    return [edges.onError, { ...state, error }];
  }

  const updatedFromNote: Note = {
    ...fromNote,
    links: [...fromNote.links, { to: toId, relation }],
    updated: new Date().toISOString(),
  };
  await utils.writeNote(updatedFromNote);
  utils.createLink(fromId, toId, relation);

  const result = { fromId, toId, relation, linked: true as const };
  utils.print(JSON.stringify(result));
  return [edges.onLinked, { ...state, result }];
};
