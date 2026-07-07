import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-link.ts";
import { Note } from "../../utils/zettel_fs.ts";

function note(id: string, links: Note["links"] = []): Note {
  return {
    id,
    title: "Test",
    tags: [],
    created: "2026-07-06T00:00:00.000Z",
    updated: "2026-07-06T00:00:00.000Z",
    links,
    body: "Body",
  };
}

Deno.test("zettelLinkNode should link two existing zettels", async () => {
  const initialState: State = { fromId: "a", toId: "b", relation: "builds on" };
  const linked: unknown[] = [];
  const written: Note[] = [];

  const utils: Utils = {
    readNote: (id) => Promise.resolve(note(id)),
    writeNote: (n) => {
      written.push(n);
      return Promise.resolve();
    },
    createLink: (fromId, toId, relation) => linked.push({ fromId, toId, relation }),
    print: () => {},
  };

  const result = await factory({ onLinked: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(linked, [{ fromId: "a", toId: "b", relation: "builds on" }]);
  assertEquals(written.length, 1);
  assertEquals(written[0].links, [{ to: "b", relation: "builds on" }]);
});

Deno.test("zettelLinkNode should transition to onError when either zettel is missing", async () => {
  const initialState: State = { fromId: "a", toId: "missing", relation: "relates to" };

  const utils: Utils = {
    readNote: (id) => Promise.resolve(id === "a" ? note(id) : null),
    writeNote: () => {
      throw new Error("should not be called");
    },
    createLink: () => {
      throw new Error("should not be called");
    },
    print: () => {},
  };

  const result = await factory({ onLinked: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "error");
  assertEquals(result[1].error, "Cannot link: one or both zettels not found (a, missing)");
});
