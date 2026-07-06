import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-link.ts";

Deno.test("zettelLinkNode should link two existing zettels", async () => {
  const initialState: State = { fromId: "a", toId: "b", relation: "builds on" };
  const linked: unknown[] = [];

  const utils: Utils = {
    getZettel: (id) => ({ id }),
    createLink: (fromId, toId, relation) => linked.push({ fromId, toId, relation }),
    print: () => {},
  };

  const result = await factory({ onLinked: "next", onError: "error" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(linked, [{ fromId: "a", toId: "b", relation: "builds on" }]);
});

Deno.test("zettelLinkNode should transition to onError when either zettel is missing", async () => {
  const initialState: State = { fromId: "a", toId: "missing", relation: "relates to" };

  const utils: Utils = {
    getZettel: (id) => (id === "a" ? { id } : null),
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
