import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-get.ts";
import { ZettelRecord } from "../../utils/zettel_db.ts";

const sample: ZettelRecord = {
  id: "20260706120000",
  title: "Test",
  body: "Body",
  tags: ["a"],
  created: "2026-07-06T12:00:00.000Z",
  hasEmbedding: false,
};

Deno.test("zettelGetNode should return the zettel and its links when found", async () => {
  const initialState: State = { id: sample.id };

  const utils: Utils = {
    getZettel: (id) => (id === sample.id ? sample : null),
    getLinks: () => [{ fromId: sample.id, toId: "other", relation: "relates to" }],
    print: () => {},
  };

  const result = await factory({ onFound: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result?.id, sample.id);
  assertEquals(result[1].result?.links.length, 1);
});

Deno.test("zettelGetNode should transition to onNotFound when the id does not exist", async () => {
  const initialState: State = { id: "missing-id" };

  const utils: Utils = {
    getZettel: () => null,
    getLinks: () => [],
    print: () => {},
  };

  const result = await factory({ onFound: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "missing");
  assertEquals(result[1].error, "Zettel not found: missing-id");
});
