import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../azk-delete.ts";
import { Note } from "../../utils/azk_fs.ts";

const existingNote: Note = {
  id: "20260706120000",
  title: "Test",
  tags: [],
  created: "2026-07-06T00:00:00.000Z",
  updated: "2026-07-06T00:00:00.000Z",
  links: [],
  body: "Body",
};

Deno.test("azkDeleteNode should delete and return the id when it exists", async () => {
  const initialState: State = { id: "20260706120000" };
  const deletedFiles: string[] = [];
  const deletedFromIndex: string[] = [];

  const utils: Utils = {
    readNote: (id) => Promise.resolve(id === existingNote.id ? existingNote : null),
    deleteNoteFile: (id) => {
      deletedFiles.push(id);
      return Promise.resolve();
    },
    deleteAzk: (id) => {
      deletedFromIndex.push(id);
      return true;
    },
    print: () => {},
  };

  const result = await factory({ onDeleted: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result, { id: "20260706120000", deleted: true });
  assertEquals(deletedFiles, ["20260706120000"]);
  assertEquals(deletedFromIndex, ["20260706120000"]);
});

Deno.test("azkDeleteNode should transition to onNotFound when the id does not exist", async () => {
  const initialState: State = { id: "missing-id" };

  const utils: Utils = {
    readNote: () => Promise.resolve(null),
    deleteNoteFile: () => Promise.resolve(),
    deleteAzk: () => false,
    print: () => {},
  };

  const result = await factory({ onDeleted: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "missing");
  assertEquals(result[1].error, "Azk not found: missing-id");
});
