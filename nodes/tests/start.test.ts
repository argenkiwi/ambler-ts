import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../start.ts";

test("startNode should transition to onSuccess with 0 if input is empty", async () => {
  const initialState: State = { count: 0 };

  const utils: Utils = {
    readLine: (_msg: string) => "",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "NEXT", onError: "ERROR" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("NEXT");
  expect(result[1].count).toEqual(0);
});

test("startNode should transition to onSuccess with input number", async () => {
  const initialState: State = { count: 0 };

  const utils: Utils = {
    readLine: (_msg: string) => "42",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "NEXT", onError: "ERROR" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("NEXT");
  expect(result[1].count).toEqual(42);
});

test("startNode should transition to onError if input is invalid", async () => {
  const initialState: State = { count: 123 };

  const utils: Utils = {
    readLine: (_msg: string) => "abc",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "NEXT", onError: "ERROR" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("ERROR");
  expect(result[1].count).toEqual(123);
});

test("startNode should transition to onError if input has trailing junk", async () => {
  const initialState: State = { count: 123 };

  const utils: Utils = {
    readLine: (_msg: string) => "3abc",
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "NEXT", onError: "ERROR" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("ERROR");
  expect(result[1].count).toEqual(123);
});

test("startNode should transition to onSuccess with 0 at end of input", async () => {
  const initialState: State = { count: 7 };

  const utils: Utils = {
    readLine: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory(
    { onSuccess: "NEXT", onError: "ERROR" },
    utils,
  )(initialState);

  expect(result[0]).toEqual("NEXT");
  expect(result[1].count).toEqual(0);
});
