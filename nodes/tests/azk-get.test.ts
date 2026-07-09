import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../azk-get.ts";
import { Note } from "../../utils/azk_fs.ts";

const sample: Note = {
  id: "20260706120000",
  title: "Test",
  tags: ["a"],
  created: "2026-07-06T12:00:00.000Z",
  updated: "2026-07-06T12:00:00.000Z",
  links: [],
  body: "Body",
};

Deno.test("azkGetNode should return the note and its links when found", async () => {
  const initialState: State = { id: sample.id };

  const utils: Utils = {
    readNote: (id) => Promise.resolve(id === sample.id ? sample : null),
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

Deno.test("azkGetNode should transition to onNotFound when the id does not exist", async () => {
  const initialState: State = { id: "missing-id" };

  const utils: Utils = {
    readNote: () => Promise.resolve(null),
    getLinks: () => [],
    print: () => {},
  };

  const result = await factory({ onFound: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "missing");
  assertEquals(result[1].error, "Azk not found: missing-id");
});
