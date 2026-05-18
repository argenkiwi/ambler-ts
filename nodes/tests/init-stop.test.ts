import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../init-stop.ts";

Deno.test("initStopNode should print error and exit 1 when error exists", async () => {
  const initialState: State = {
    targetDir: "new-project",
    error: "Something went wrong",
  };
  let printed = "";
  let exitCode: number | undefined;

  const utils: Utils = {
    print: (msg) => {
      printed += msg;
    },
    exit: (code) => {
      exitCode = code;
    },
  };

  const [edge, _state] = await factory(
    { onDone: "NONE" },
    utils,
  )(initialState);

  assertEquals(edge, "NONE");
  assertEquals(printed.includes("Error: Something went wrong"), true);
  assertEquals(exitCode, 1);
});

Deno.test("initStopNode should print success messages when no error", async () => {
  const initialState: State = { targetDir: "new-project" };
  let printed = "";
  let exitCode: number | undefined;

  const utils: Utils = {
    print: (msg) => {
      printed += msg + "\n";
    },
    exit: (code) => {
      exitCode = code;
    },
  };

  const [edge, _state] = await factory(
    { onDone: "NONE" },
    utils,
  )(initialState);

  assertEquals(edge, "NONE");
  assertEquals(
    printed.includes('Initializing ambler project in "new-project"'),
    true,
  );
  assertEquals(printed.includes("Created: ambler.ts"), true);
  assertEquals(printed.includes("Created: deno.json"), true);
  assertEquals(exitCode, undefined);
});
