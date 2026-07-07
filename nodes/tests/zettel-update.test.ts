import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-update.ts";
import { Note } from "../../utils/zettel_fs.ts";

const existingNote: Note = {
  id: "20260706120000",
  title: "Old title",
  tags: ["x"],
  created: "2026-07-06T00:00:00.000Z",
  updated: "2026-07-06T00:00:00.000Z",
  links: [],
  body: "old body",
};

Deno.test("zettelUpdateNode should re-embed and update when body changes", async () => {
  const initialState: State = { id: "20260706120000", body: "new body" };
  const written: unknown[] = [];
  const upserted: unknown[] = [];

  const utils: Utils = {
    readNote: () => Promise.resolve(existingNote),
    writeNote: (note) => {
      written.push(note);
      return Promise.resolve();
    },
    embed: (text) => Promise.resolve(text === "new body" ? [0.5] : null),
    upsertZettel: (zettel, embedding) => upserted.push({ zettel, embedding }),
    print: () => {},
  };

  const result = await factory({ onUpdated: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result, { id: "20260706120000", updated: true });
  assertEquals(written.length, 1);
  assertEquals((written[0] as Note).body, "new body");
  assertEquals(upserted.length, 1);
  assertEquals((upserted[0] as { embedding?: number[] }).embedding, [0.5]);
});

Deno.test("zettelUpdateNode should not re-embed when body is unchanged", async () => {
  const initialState: State = { id: "20260706120000", tags: ["y"] };
  let embedCalled = false;

  const utils: Utils = {
    readNote: () => Promise.resolve(existingNote),
    writeNote: () => Promise.resolve(),
    embed: () => {
      embedCalled = true;
      return Promise.resolve([0.9]);
    },
    upsertZettel: () => {},
    print: () => {},
  };

  await factory({ onUpdated: "next", onNotFound: "missing" }, utils)(initialState);

  assertEquals(embedCalled, false);
});

Deno.test("zettelUpdateNode should transition to onNotFound when the id does not exist", async () => {
  const initialState: State = { id: "missing-id", title: "New title" };

  const utils: Utils = {
    readNote: () => Promise.resolve(null),
    writeNote: () => Promise.resolve(),
    embed: () => Promise.resolve(null),
    upsertZettel: () => {},
    print: () => {},
  };

  const result = await factory({ onUpdated: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "missing");
  assertEquals(result[1].error, "Zettel not found: missing-id");
});
