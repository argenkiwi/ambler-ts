import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../count.ts";

test("countNode should increment count and transition to onCount if random > 0.5", async () => {
  const initialState: State = { count: 5 };

  const utils: Utils = {
    print: (_msg: string) => {},
    sleep: async (_ms: number) => {},
    random: () => 0.6,
  };

  const result = await factory(
    { onCount: "onCount", onStop: "onStop" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("onCount");
  expect(result[1].count).toEqual(6);
});

test("countNode should increment count and transition to onStop if random <= 0.5", async () => {
  const initialState: State = { count: 10 };

  const utils: Utils = {
    print: (_msg: string) => {},
    sleep: async (_ms: number) => {},
    random: () => 0.4,
  };

  const result = await factory(
    { onCount: "onCount", onStop: "onStop" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("onStop");
  expect(result[1].count).toEqual(11);
});
