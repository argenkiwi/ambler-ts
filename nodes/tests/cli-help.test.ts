import { expect, test } from "bun:test";
import { guide, TOPICS } from "../../guides/index.ts";
import { factory, USAGE } from "../cli-help.ts";

const help = (state: {
  command?: string;
  argv: string[];
  exitCode: number;
}) => {
  const printed: string[] = [];
  const errors: string[] = [];
  const run = factory(
    { onDone: "DONE" },
    { print: (m) => printed.push(m), printError: (m) => errors.push(m) },
  )(state);
  return { run, printed, errors };
};

test("cliHelp prints usage and transitions to onDone without changing the exit code", async () => {
  const { run, printed } = help({ argv: [], exitCode: 2 });
  const [next, state] = await run;
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(2);
  expect(printed).toEqual([USAGE]);
});

test("cliHelp prints the general guide for help without a topic", async () => {
  const { run, printed } = help({ command: "help", argv: [], exitCode: 0 });
  const [next, state] = await run;
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(0);
  expect(printed).toEqual([guide() as string]);
});

test("cliHelp prints the guide for a known topic", async () => {
  const { run, printed } = help({
    command: "help",
    argv: ["node-design"],
    exitCode: 0,
  });
  const [, state] = await run;
  expect(state.exitCode).toBe(0);
  expect(printed).toEqual([guide("node-design") as string]);
});

test("cliHelp lists the topics on standard error for an unknown one and exits 1", async () => {
  const { run, printed, errors } = help({
    command: "help",
    argv: ["bogus"],
    exitCode: 0,
  });
  const [next, state] = await run;
  expect(next).toBe("DONE");
  expect(state.exitCode).toBe(1);
  expect(printed).toEqual([]);
  expect(errors).toEqual([`No guide for bogus. Topics: ${TOPICS.join(", ")}`]);
});

test("every topic has a guide that names the project's own CLI", () => {
  for (const topic of TOPICS) {
    const text = guide(topic) ?? "";
    expect(text.length).toBeGreaterThan(0);
    for (const verb of ["node", "util", "walk", "check", "help"]) {
      expect(text).not.toContain(`\`ambler ${verb}`);
    }
  }
});
