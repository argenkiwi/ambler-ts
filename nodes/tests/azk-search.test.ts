import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../azk-search.ts";
import { AzkMeta } from "../../utils/azk_db.ts";

function record(id: string, title: string): AzkMeta {
  return {
    id,
    title,
    tags: [],
    created: "2026-07-06T00:00:00.000Z",
    updated: "2026-07-06T00:00:00.000Z",
    bodyHash: "hash",
    hasEmbedding: false,
  };
}

Deno.test("azkSearchNode should rank keyword matches when no embeddings host is reachable", async () => {
  const initialState: State = { query: "sqlite" };

  const utils: Utils = {
    searchAzk: () => [record("a", "SQLite notes"), record("b", "Other note")],
    embed: async () => null,
    getAllEmbeddings: () => [],
    getAzkMeta: () => null,
    print: () => {},
  };

  const result = await factory({ onFound: "next", onEmpty: "empty" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].results?.map((r) => r.id), ["a", "b"]);
});

Deno.test("azkSearchNode should surface a semantically similar note with no keyword overlap", async () => {
  const initialState: State = { query: "note taking" };

  const utils: Utils = {
    searchAzk: () => [],
    embed: async () => [1, 0],
    getAllEmbeddings: () => [{ id: "c", vector: [1, 0] }],
    getAzkMeta: (id) => (id === "c" ? record("c", "Zettelkasten") : null),
    print: () => {},
  };

  const result = await factory({ onFound: "next", onEmpty: "empty" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].results?.[0].id, "c");
});

Deno.test("azkSearchNode should transition to onEmpty when nothing matches", async () => {
  const initialState: State = { query: "nothing" };

  const utils: Utils = {
    searchAzk: () => [],
    embed: async () => null,
    getAllEmbeddings: () => [],
    getAzkMeta: () => null,
    print: () => {},
  };

  const result = await factory({ onFound: "next", onEmpty: "empty" }, utils)(
    initialState,
  );

  assertEquals(result[0], "empty");
  assertEquals(result[1].results, []);
});
