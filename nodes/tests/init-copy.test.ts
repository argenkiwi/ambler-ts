import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../init-copy.ts";

Deno.test("initCopyNode should transition to onSuccess when copyFile succeeds", async () => {
  const initialState: State = { targetDir: "new-project" };
  let copiedFrom = "";
  let copiedTo = "";

  const utils: Utils = {
    copyFile: (from: string, to: string) => {
      copiedFrom = from;
      copiedTo = to;
      return Promise.resolve();
    },
    getAmblerSrc: () => "/source/ambler.ts",
  };

  const [edge, state] = await factory(
    { onSuccess: "config", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "config");
  assertEquals(copiedFrom, "/source/ambler.ts");
  assertEquals(copiedTo, "new-project/ambler.ts");
  assertEquals(state.error, undefined);
});

Deno.test("initCopyNode should transition to onError when copyFile fails", async () => {
  const initialState: State = { targetDir: "new-project" };

  const utils: Utils = {
    copyFile: () => Promise.reject(new Error("Disk full")),
    getAmblerSrc: () => "/source/ambler.ts",
  };

  const [edge, state] = await factory(
    { onSuccess: "config", onError: "stop" },
    utils,
  )(initialState);

  assertEquals(edge, "stop");
  assertEquals(state.error, "Failed to copy ambler.ts: Disk full");
});
