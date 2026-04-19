import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as StartNode from "./startNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test(
  "startNode should transition to onSuccess with 0 if input is empty",
  async () => {
    const initialState: StartNode.State = { count: 0 };
    let capturedState: StartNode.State | undefined;
    const captureNext: Nextable<StartNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: StartNode.Utils = {
      readLine: async () => "",
      print: () => {},
    };

    const nextResult = await StartNode.create(
      { onSuccess: captureNext, onError: captureNext },
      utils,
    )(initialState);

    if (!nextResult) throw new Error("Expected Next, got null");
    await nextResult.run();

    assertEquals(capturedState?.count, 0);
  },
);

Deno.test(
  "startNode should transition to onSuccess with input number",
  async () => {
    const initialState: StartNode.State = { count: 0 };
    let capturedState: StartNode.State | undefined;
    const captureNext: Nextable<StartNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: StartNode.Utils = {
      readLine: async () => "42",
      print: () => {},
    };

    const nextResult = await StartNode.create(
      { onSuccess: captureNext, onError: captureNext },
      utils,
    )(initialState);

    if (!nextResult) throw new Error("Expected Next, got null");
    await nextResult.run();

    assertEquals(capturedState?.count, 42);
  },
);

Deno.test(
  "startNode should transition to onError if input is invalid",
  async () => {
    const initialState: StartNode.State = { count: 123 };
    let capturedState: StartNode.State | undefined;
    const captureSuccess: Nextable<StartNode.State> = async (_s) => {
      return null;
    };
    const captureError: Nextable<StartNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: StartNode.Utils = {
      readLine: async () => "abc",
      print: () => {},
    };

    const nextResult = await StartNode.create(
      { onSuccess: captureSuccess, onError: captureError },
      utils,
    )(initialState);

    if (!nextResult) throw new Error("Expected Next, got null");
    await nextResult.run();

    assertEquals(capturedState?.count, 123);
  },
);
