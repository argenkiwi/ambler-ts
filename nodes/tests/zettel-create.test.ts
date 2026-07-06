import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-create.ts";

Deno.test("zettelCreateNode should create a zettel and return its id when given valid input", async () => {
  const initialState: State = { title: "Test", body: "Body text", tags: ["a"] };
  const created: unknown[] = [];

  const utils: Utils = {
    generateId: () => "20260706120000",
    embed: async () => [0.1, 0.2],
    createZettel: (zettel, embedding) => created.push({ zettel, embedding }),
    createLink: () => {},
    print: () => {},
  };

  const result = await factory({ onCreated: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result?.id, "20260706120000");
  assertEquals(created.length, 1);
});

Deno.test("zettelCreateNode should create links when links are provided", async () => {
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
    createZettel: () => {},
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

Deno.test("zettelCreateNode should transition to onError when createZettel throws", async () => {
  const initialState: State = { title: "Test", body: "Body", tags: [] };

  const utils: Utils = {
    generateId: () => "20260706120000",
    embed: async () => null,
    createZettel: () => {
      throw new Error("disk full");
    },
    createLink: () => {},
    print: () => {},
  };

  const result = await factory({ onCreated: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "error");
  assertEquals(result[1].error, "disk full");
});
