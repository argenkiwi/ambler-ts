import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-search.ts";
import { ZettelRecord } from "../../utils/zettel_db.ts";

function record(id: string, title: string): ZettelRecord {
  return { id, title, body: "", tags: [], created: "2026-07-06T00:00:00.000Z", hasEmbedding: false };
}

Deno.test("zettelSearchNode should rank keyword matches when no embeddings host is reachable", async () => {
  const initialState: State = { query: "sqlite" };

  const utils: Utils = {
    searchZettels: () => [record("a", "SQLite notes"), record("b", "Other note")],
    embed: async () => null,
    getAllEmbeddings: () => [],
    getZettel: () => null,
    print: () => {},
  };

  const result = await factory({ onFound: "next", onEmpty: "empty" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].results?.map((r) => r.id), ["a", "b"]);
});

Deno.test("zettelSearchNode should surface a semantically similar note with no keyword overlap", async () => {
  const initialState: State = { query: "note taking" };

  const utils: Utils = {
    searchZettels: () => [],
    embed: async () => [1, 0],
    getAllEmbeddings: () => [{ id: "c", vector: [1, 0] }],
    getZettel: (id) => (id === "c" ? record("c", "Zettelkasten") : null),
    print: () => {},
  };

  const result = await factory({ onFound: "next", onEmpty: "empty" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].results?.[0].id, "c");
});

Deno.test("zettelSearchNode should transition to onEmpty when nothing matches", async () => {
  const initialState: State = { query: "nothing" };

  const utils: Utils = {
    searchZettels: () => [],
    embed: async () => null,
    getAllEmbeddings: () => [],
    getZettel: () => null,
    print: () => {},
  };

  const result = await factory({ onFound: "next", onEmpty: "empty" }, utils)(
    initialState,
  );

  assertEquals(result[0], "empty");
  assertEquals(result[1].results, []);
});
