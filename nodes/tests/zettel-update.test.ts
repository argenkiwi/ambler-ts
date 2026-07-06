import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-update.ts";

Deno.test("zettelUpdateNode should re-embed and update when body changes", async () => {
  const initialState: State = { id: "20260706120000", body: "new body" };
  const calls: unknown[] = [];

  const utils: Utils = {
    embed: async (text) => (text === "new body" ? [0.5] : null),
    updateZettel: (id, fields, embedding) => {
      calls.push({ id, fields, embedding });
      return true;
    },
    print: () => {},
  };

  const result = await factory({ onUpdated: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result, { id: "20260706120000", updated: true });
  assertEquals(calls, [
    { id: "20260706120000", fields: { title: undefined, body: "new body", tags: undefined }, embedding: [0.5] },
  ]);
});

Deno.test("zettelUpdateNode should not re-embed when body is unchanged", async () => {
  const initialState: State = { id: "20260706120000", tags: ["x"] };
  let embedCalled = false;

  const utils: Utils = {
    embed: async () => {
      embedCalled = true;
      return [0.9];
    },
    updateZettel: () => true,
    print: () => {},
  };

  await factory({ onUpdated: "next", onNotFound: "missing" }, utils)(initialState);

  assertEquals(embedCalled, false);
});

Deno.test("zettelUpdateNode should transition to onNotFound when the id does not exist", async () => {
  const initialState: State = { id: "missing-id", title: "New title" };

  const utils: Utils = {
    embed: async () => null,
    updateZettel: () => false,
    print: () => {},
  };

  const result = await factory({ onUpdated: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "missing");
  assertEquals(result[1].error, "Zettel not found: missing-id");
});
