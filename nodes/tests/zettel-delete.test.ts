import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-delete.ts";

Deno.test("zettelDeleteNode should delete and return the id when it exists", async () => {
  const initialState: State = { id: "20260706120000" };

  const utils: Utils = {
    deleteZettel: (id) => id === "20260706120000",
    print: () => {},
  };

  const result = await factory({ onDeleted: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].result, { id: "20260706120000", deleted: true });
});

Deno.test("zettelDeleteNode should transition to onNotFound when the id does not exist", async () => {
  const initialState: State = { id: "missing-id" };

  const utils: Utils = {
    deleteZettel: () => false,
    print: () => {},
  };

  const result = await factory({ onDeleted: "next", onNotFound: "missing" }, utils)(
    initialState,
  );

  assertEquals(result[0], "missing");
  assertEquals(result[1].error, "Zettel not found: missing-id");
});
