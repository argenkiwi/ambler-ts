import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../zettel-router.ts";

const edges = {
  onSearch: "search",
  onCreate: "create",
  onGet: "get",
  onUpdate: "update",
  onDelete: "delete",
  onLink: "link",
  onReindex: "reindex",
  onError: "error",
};

Deno.test("zettelRouterNode should transition to onSearch for search action", async () => {
  const state: State = { action: "search" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "search");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onCreate for create action", async () => {
  const state: State = { action: "CREATE" }; // Test case insensitivity
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "create");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onGet for get action", async () => {
  const state: State = { action: "get" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "get");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onUpdate for update action", async () => {
  const state: State = { action: "update" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "update");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onDelete for delete action", async () => {
  const state: State = { action: "delete" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "delete");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onLink for link action", async () => {
  const state: State = { action: "link" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "link");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onReindex for reindex action", async () => {
  const state: State = { action: "reindex" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "reindex");
  assertEquals(result[1], state);
});

Deno.test("zettelRouterNode should transition to onError if no action specified", async () => {
  const state: State = {};
  let printedMsg = "";
  const utils: Utils = {
    print: (msg) => {
      printedMsg = msg;
    },
  };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "error");
  assertEquals(result[1].error, "No action specified");
  assertEquals(JSON.parse(printedMsg), { error: "No action specified" });
});

Deno.test("zettelRouterNode should transition to onError if unknown action specified", async () => {
  const state: State = { action: "invalid-action" };
  let printedMsg = "";
  const utils: Utils = {
    print: (msg) => {
      printedMsg = msg;
    },
  };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "error");
  assertEquals(result[1].error, "Unknown action: invalid-action");
  assertEquals(JSON.parse(printedMsg), { error: "Unknown action: invalid-action" });
});
