import { expect, test } from "bun:test";
import { stateContracts, todo } from "../conventions.ts";

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

const REGISTRY = `import type { Board } from "../utils/game.ts";

export interface HasCount {
  count: number;
}

export interface HasBoard {
  readonly board?: Board;
}
`;

test("stateContracts accepts the registry and nodes that compose it", () => {
  expect(stateContracts("nodes/state.ts", REGISTRY)).toEqual([]);
  expect(
    stateContracts(
      "nodes/count.ts",
      'import type { HasBoard, HasCount } from "./state.ts";\n\nexport interface State extends HasCount, HasBoard {}\n',
    ),
  ).toEqual([]);
  expect(
    stateContracts("nodes/bye.ts", "export type State = object;\n"),
  ).toEqual([]);
  // Walks, utils and tests are not nodes.
  expect(
    stateContracts(
      "walks/demo.ts",
      "export interface State {\n  n: number;\n}\n",
    ),
  ).toEqual([]);
  expect(stateContracts("nodes/tests/count.test.ts", "")).toEqual([]);
});

test("stateContracts rejects a Has* with two fields", () => {
  const source = `${REGISTRY}\nexport interface HasHp {\n  hp: number;\n  mp: number;\n}\n`;
  expect(stateContracts("nodes/state.ts", source)).toEqual([
    "nodes/state.ts:11: state-contracts: give HasHp exactly one field and nothing else: interface HasHp { field: T }",
  ]);
});

test("stateContracts rejects a Has* with a method or no field", () => {
  for (const body of ["hp(): number;", "", "hp: number;\n  heal(): void;"]) {
    expect(
      stateContracts(
        "nodes/state.ts",
        `export interface HasHp {\n  ${body}\n}\n`,
      ),
    ).toHaveLength(1);
  }
});

test("stateContracts rejects a Has* named after another field", () => {
  expect(
    stateContracts(
      "nodes/state.ts",
      "export interface HasHp {\n  health: number;\n}\n",
    ),
  ).toEqual([
    "nodes/state.ts:1: state-contracts: rename HasHp to HasHealth, after its field health",
  ]);
});

test("stateContracts rejects a Has* declared outside the registry", () => {
  const source =
    "export interface HasHp {\n  hp: number;\n}\n\nexport interface State extends HasHp {}\n";
  for (const path of ["nodes/heal.ts", "utils/game.ts"]) {
    expect(stateContracts(path, source)).toEqual([
      `${path}:1: state-contracts: move HasHp to nodes/state.ts: only the registry declares Has* contracts`,
    ]);
  }
});

test("stateContracts rejects fields declared on a node's State", () => {
  for (const source of [
    "export interface State {\n  hp: number;\n}\n",
    "export interface State extends HasCount {\n  hp: number;\n}\n",
  ]) {
    expect(stateContracts("nodes/heal.ts", source)).toEqual([
      "nodes/heal.ts:1: state-contracts: move hp out of State into Has* contracts in nodes/state.ts, and extend them",
    ]);
  }
  expect(
    stateContracts("nodes/heal.ts", "export type State = { hp: number };\n"),
  ).toEqual([
    "nodes/heal.ts:1: state-contracts: make State an interface that extends Has* contracts from ./state.ts, or type State = object for none",
  ]);
});

test("stateContracts rejects a node's State that extends a non-Has* type", () => {
  expect(
    stateContracts(
      "nodes/heal.ts",
      "export interface State extends Player {}\n",
    ),
  ).toEqual([
    "nodes/heal.ts:1: state-contracts: State extends only Has* contracts, not Player",
  ]);
});

test("stateContracts rejects a node with no State export", () => {
  for (const source of [
    "export const factory = () => {};\n",
    "interface State {}\nexport const factory = () => {};\n",
  ]) {
    expect(stateContracts("nodes/heal.ts", source)).toEqual([
      "nodes/heal.ts:1: state-contracts: export State: interface State extends HasA, HasB {}, or type State = object for none",
    ]);
  }
});

test("stateContracts ignores Has* in comments and strings", () => {
  const source =
    'export type State = object;\n// export interface HasHp { hp: number; mp: number }\nconst s = "interface HasHp {}";\n';
  expect(stateContracts("nodes/heal.ts", source)).toEqual([]);
});
