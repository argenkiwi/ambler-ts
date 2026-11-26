import { expect, test } from "bun:test";
import { factory } from "../cli-route.ts";

const edges = {
  onNode: "NODE",
  onWalk: "WALK",
  onUtil: "UTIL",
  onCheck: "CHECK",
  onHelp: "HELP",
  onUnknown: "UNKNOWN",
};

const route = (argv: string[]) => factory(edges)({ argv, exitCode: 0 });

for (const [command, target] of [
  ["node", "NODE"],
  ["walk", "WALK"],
  ["util", "UTIL"],
  ["check", "CHECK"],
] as const) {
  test(`cliRoute sends "${command}" to ${target} and consumes it`, async () => {
    const [next, state] = await route([command, "foo", "--bar"]);
    expect(next).toBe(target);
    expect(state.argv).toEqual(["foo", "--bar"]);
  });
}

test("cliRoute sends help, --help and -h to help with exit code 0", async () => {
  for (const flag of ["help", "--help", "-h"]) {
    const [next, state] = await route([flag]);
    expect(next).toBe("HELP");
    expect(state.exitCode).toBe(0);
  }
});

test("cliRoute leaves the help topic in argv", async () => {
  const [next, state] = await route(["help", "walk"]);
  expect(next).toBe("HELP");
  expect(state.command).toBe("help");
  expect(state.argv).toEqual(["walk"]);
});

test("cliRoute sends no command to help with exit code 2", async () => {
  const [next, state] = await route([]);
  expect(next).toBe("HELP");
  expect(state.exitCode).toBe(2);
});

test("cliRoute sends an unknown command to unknown, keeping its name", async () => {
  const [next, state] = await route(["bogus"]);
  expect(next).toBe("UNKNOWN");
  expect(state.command).toBe("bogus");
});
