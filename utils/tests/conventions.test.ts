import { expect, test } from "bun:test";
import { todo } from "../conventions.ts";

// Built in pieces so that this test is not itself a placeholder the rule finds.
const NOT_YET = ["not yet", "implemented"].join(" ");
const unwiredCall = (edge: string) => ["unwired(", `"${edge}"`, ")"].join("");

test("todo finds a body left to implement", () => {
  const source = `export const factory = () => async () => {\n  throw new Error("${NOT_YET}");\n};\n`;

  expect(todo("nodes/greet.ts", source)).toEqual([
    `nodes/greet.ts:2: todo: implement this: it still throws \`${NOT_YET}\``,
  ]);
});

test("todo finds a test that only expects the placeholder", () => {
  const source = `expect(async () => {\n  await run();\n}).toThrow('${NOT_YET}');\n`;

  expect(todo("nodes/tests/greet.test.ts", source)).toEqual([
    `nodes/tests/greet.test.ts:3: todo: finish this test: assert the next node and the new state, not \`${NOT_YET}\``,
  ]);
});

test("todo finds an edge left to wire", () => {
  const source = `GREET: () => greetNode.factory({ onDone: ${unwiredCall("GREET.onDone")} }),\n`;

  expect(todo("walks/hello.ts", source)).toEqual([
    "walks/hello.ts:1: todo: wire GREET.onDone: name the next node, or null to end the walk",
  ]);
});

test("todo reports every placeholder in order", () => {
  const source = [
    `a({ onX: ${unwiredCall("A.onX")}, onY: ${unwiredCall("A.onY")} });`,
    "",
    `throw new Error("${NOT_YET}");`,
  ].join("\n");

  expect(todo("t.ts", source).map((line) => line.split(": todo")[0])).toEqual([
    "t.ts:1",
    "t.ts:1",
    "t.ts:3",
  ]);
});

test("todo ignores mentions that are not placeholders", () => {
  const source = [
    `const MARKER = "${NOT_YET}";`,
    'throw new Error("something else");',
    "function unwired(edge: string): never {",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: a template the scaffolder fills in
    '  const call = `unwired("${id}")`;',
    "}",
  ].join("\n");

  expect(todo("t.ts", source)).toEqual([]);
});
