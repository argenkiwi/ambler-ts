import { expect, test } from "bun:test";
import { factory } from "../cli-error.ts";

test("cliError reports the unknown command and sets exit code 2", async () => {
  const errors: string[] = [];
  const [next, state] = await factory(
    { onDone: "DONE" },
    { printError: (m) => errors.push(m) },
  )({ command: "bogus", exitCode: 0 });
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(2);
  expect(errors).toEqual(["Unknown command: bogus"]);
});
