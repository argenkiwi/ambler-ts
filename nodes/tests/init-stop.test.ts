import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../init-stop.ts";

test("initStopNode should print error and exit 1 when error exists", async () => {
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

  const [edge, _state] = await factory({ onDone: "NONE" }, utils)(initialState);

  expect(edge).toEqual("NONE");
  expect(printed.includes("Error: Something went wrong")).toEqual(true);
  expect(exitCode).toEqual(1);
});

test("initStopNode should print success messages when no error", async () => {
  const initialState: State = { targetDir: "new-project" };
  let printed = "";
  let exitCode: number | undefined;

  const utils: Utils = {
    print: (msg) => {
      printed += `${msg}\n`;
    },
    exit: (code) => {
      exitCode = code;
    },
  };

  const [edge, _state] = await factory({ onDone: "NONE" }, utils)(initialState);

  expect(edge).toEqual("NONE");
  expect(
    printed.includes('Initializing ambler project in "new-project"'),
  ).toEqual(true);
  expect(printed.includes("Created: ambler.ts")).toEqual(true);
  expect(printed.includes("Created: package.json")).toEqual(true);
  expect(exitCode).toBeUndefined();
});
