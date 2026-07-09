import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../azk-create.ts";

Deno.test("azkCreateNode should create a note and return its id when given valid input", async () => {
  const initialState: State = { title: "Test", body: "Body text", tags: ["a"] };
  const written: unknown[] = [];
  const upserted: unknown[] = [];

  const utils: Utils = {
    generateId: () => "20260706120000",
    embed: async () => [0.1, 0.2],
    writeNote: async (note) => {
      written.push(note);
    },
    upsertAzk: (note, embedding) => upserted.push({ note, embedding }),
    createLink: () => {},
    print: () => {},
  };

  const result = await factory({ onCreated: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result?.id, "20260706120000");
  assertEquals(written.length, 1);
  assertEquals(upserted.length, 1);
});

Deno.test("azkCreateNode should create links when links are provided", async () => {
  const initialState: State = {
    title: "Test",
    body: "Body text",
    tags: [],
    links: [{ toId: "20260101000000", relation: "builds on" }],
  };
  const linked: unknown[] = [];

  const utils: Utils = {
    generateId: () => "20260706120000",
    embed: async () => null,
    writeNote: async () => {},
    upsertAzk: () => {},
    createLink: (fromId, toId, relation) => linked.push({ fromId, toId, relation }),
    print: () => {},
  };

  const result = await factory({ onCreated: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(linked, [
    { fromId: "20260706120000", toId: "20260101000000", relation: "builds on" },
  ]);
  assertEquals(result[1].result?.links, initialState.links);
});

Deno.test("azkCreateNode should transition to onError when writeNote throws", async () => {
  const initialState: State = { title: "Test", body: "Body", tags: [] };

  const utils: Utils = {
    generateId: () => "20260706120000",
    embed: async () => null,
    writeNote: async () => {
      throw new Error("disk full");
    },
    upsertAzk: () => {},
    createLink: () => {},
    print: () => {},
  };

  const result = await factory({ onCreated: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "error");
  assertEquals(result[1].error, "disk full");
});
