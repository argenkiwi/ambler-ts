import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-stop.ts";

Deno.test("cloneStopNode should print success message when no error is present", async () => {
  const initialState: State = {
    sourceWalk: "counter",
    targetDir: "/target",
    filesToCopy: ["file1"],
  };

  const messages: string[] = [];
  const utils: Utils = {
    print: (msg) => messages.push(msg),
  };

  const result = await factory(
    { onDone: null },
    utils,
  )(initialState);

  assertEquals(result[0], null);
  assertEquals(messages.includes('Successfully cloned walk "counter" to "/target".'), true);
});

Deno.test("cloneStopNode should print error message when error is present", async () => {
  const initialState: State = {
    sourceWalk: "counter",
    targetDir: "/target",
    error: "Something went wrong",
  };

  const messages: string[] = [];
  const utils: Utils = {
    print: (msg) => messages.push(msg),
  };

  const result = await factory(
    { onDone: null },
    utils,
  )(initialState);

  assertEquals(result[0], null);
  assertEquals(messages.includes("Error: Something went wrong"), true);
});
