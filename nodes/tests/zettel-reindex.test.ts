import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-reindex.ts";
import { hashContent, Note } from "../../utils/zettel_fs.ts";

function note(id: string, body: string, links: Note["links"] = []): Note {
  return {
    id,
    title: `Title ${id}`,
    tags: [],
    created: "2026-01-01T00:00:00.000Z",
    updated: "2026-01-01T00:00:00.000Z",
    links,
    body,
  };
}

Deno.test("zettelReindexNode should index new notes and rebuild their links", async () => {
  const notes = [
    note("a", "body a", [{ to: "b", relation: "relates to" }]),
    note("b", "body b"),
  ];
  const upserted: unknown[] = [];
  const linksReplaced: unknown[] = [];

  const utils: Utils = {
    listNoteIds: () => Promise.resolve(["a", "b"]),
    readNote: (id) => Promise.resolve(notes.find((n) => n.id === id) ?? null),
    getZettelMeta: () => null,
    embed: () => Promise.resolve(null),
    upsertZettel: (zettel, embedding) => upserted.push({ zettel, embedding }),
    replaceLinksForNote: (fromId, links) => linksReplaced.push({ fromId, links }),
    deleteOrphans: () => [],
    print: () => {},
  };

  const initialState: State = {};
  const result = await factory({ onIndexed: "next" }, utils)(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].result, { indexed: 2, updated: 0, removed: 0, total: 2 });
  assertEquals(upserted.length, 2);
  assertEquals(linksReplaced, [
    { fromId: "a", links: [{ to: "b", relation: "relates to" }] },
    { fromId: "b", links: [] },
  ]);
});

Deno.test("zettelReindexNode should skip re-embedding unchanged notes", async () => {
  const n = note("a", "unchanged body");
  const bodyHash = await hashContent(n.body);
  let embedCalled = false;

  const utils: Utils = {
    listNoteIds: () => Promise.resolve(["a"]),
    readNote: () => Promise.resolve(n),
    getZettelMeta: () => ({ bodyHash }),
    embed: () => {
      embedCalled = true;
      return Promise.resolve([1]);
    },
    upsertZettel: () => {},
    replaceLinksForNote: () => {},
    deleteOrphans: () => [],
    print: () => {},
  };

  const result = await factory({ onIndexed: "next" }, utils)({});

  assertEquals(embedCalled, false);
  assertEquals(result[1].result, { indexed: 0, updated: 0, removed: 0, total: 1 });
});

Deno.test("zettelReindexNode should re-embed and count as updated when the body hash changed", async () => {
  const n = note("a", "new body");

  const utils: Utils = {
    listNoteIds: () => Promise.resolve(["a"]),
    readNote: () => Promise.resolve(n),
    getZettelMeta: () => ({ bodyHash: "stale-hash" }),
    embed: () => Promise.resolve([1, 2]),
    upsertZettel: () => {},
    replaceLinksForNote: () => {},
    deleteOrphans: () => [],
    print: () => {},
  };

  const result = await factory({ onIndexed: "next" }, utils)({});

  assertEquals(result[1].result, { indexed: 0, updated: 1, removed: 0, total: 1 });
});

Deno.test("zettelReindexNode should remove orphaned index entries with no matching file", async () => {
  const utils: Utils = {
    listNoteIds: () => Promise.resolve([]),
    readNote: () => Promise.resolve(null),
    getZettelMeta: () => null,
    embed: () => Promise.resolve(null),
    upsertZettel: () => {},
    replaceLinksForNote: () => {},
    deleteOrphans: (liveIds) => {
      assertEquals(liveIds, []);
      return ["stale-id"];
    },
    print: () => {},
  };

  const result = await factory({ onIndexed: "next" }, utils)({});

  assertEquals(result[1].result, { indexed: 0, updated: 0, removed: 1, total: 0 });
});
