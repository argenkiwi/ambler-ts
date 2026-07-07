import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../ambler-router.ts";

const edges = {
  onInit: "init",
  onClone: "clone",
  onError: "error",
};

Deno.test("amblerRouterNode should transition to onInit for init action", async () => {
  const state: State = { action: "init" };
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "init");
  assertEquals(result[1], state);
});

Deno.test("amblerRouterNode should transition to onClone for clone action", async () => {
  const state: State = { action: "CLONE" }; // Test case insensitivity
  const utils: Utils = { print: () => {} };
  const result = await factory(edges, utils)(state);
  assertEquals(result[0], "clone");
  assertEquals(result[1], state);
});

Deno.test("amblerRouterNode should transition to onError if no action specified", async () => {
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

Deno.test("amblerRouterNode should transition to onError if unknown action specified", async () => {
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
  assertEquals(JSON.parse(printedMsg), {
    error: "Unknown action: invalid-action",
  });
});
