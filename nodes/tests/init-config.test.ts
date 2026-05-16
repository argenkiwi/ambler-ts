import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../init-config.ts";

Deno.test("initConfigNode should transition to onSuccess when writeTextFile succeeds", async () => {
  const initialState: State = { targetDir: "new-project" };
  let writtenPath = "";
  let writtenData = "";

  const utils: Utils = {
    writeTextFile: (path: string, data: string) => {
      writtenPath = path;
      writtenData = data;
      return Promise.resolve();
    },
  };

  const [edge, state] = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(edge, "STOP");
  assertEquals(writtenPath, "new-project/deno.json");
  assertEquals(writtenData.includes("imports"), true);
  assertEquals(state.error, undefined);
});

Deno.test("initConfigNode should transition to onError when writeTextFile fails", async () => {
  const initialState: State = { targetDir: "new-project" };

  const utils: Utils = {
    writeTextFile: () => Promise.reject(new Error("Write error")),
  };

  const [edge, state] = await factory(
    { onSuccess: "STOP", onError: "STOP" },
    utils,
  )(initialState);

  assertEquals(edge, "STOP");
  assertEquals(state.error, "Failed to write deno.json: Write error");
});
