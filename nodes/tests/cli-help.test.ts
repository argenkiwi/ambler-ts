import { expect, test } from "bun:test";
import { factory, USAGE } from "../cli-help.ts";

test("cliHelp prints usage and transitions to onDone without changing the exit code", async () => {
  const printed: string[] = [];
  const [next, state] = await factory(
    { onDone: "DONE" },
    { print: (m) => printed.push(m) },
  )({ exitCode: 2 });
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(2);
  expect(printed).toEqual([USAGE]);
});
