import * as StartNode from "./startNode.ts";
import { Node, stop } from "../ambler.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "startNode should transition to onSuccess with 0 if input is empty",
  async () => {
    const initialState: StartNode.State = { count: 0 };
    let capturedState: StartNode.State | undefined;
    const captureNext: Node<StartNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: StartNode.Utils = {
      readLine: () => "",
      print: () => {},
    };

    const result = await StartNode.create(
      { onSuccess: captureNext, onError: captureNext },
      utils,
    )(initialState);

    await result();

    assertEquals(capturedState?.count, 0);
  },
);

Deno.test(
  "startNode should transition to onSuccess with input number",
  async () => {
    const initialState: StartNode.State = { count: 0 };
    let capturedState: StartNode.State | undefined;
    const captureNext: Node<StartNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: StartNode.Utils = {
      readLine: () => "42",
      print: () => {},
    };

    const result = await StartNode.create(
      { onSuccess: captureNext, onError: captureNext },
      utils,
    )(initialState);

    await result();

    assertEquals(capturedState?.count, 42);
  },
);

Deno.test(
  "startNode should transition to onError if input is invalid",
  async () => {
    const initialState: StartNode.State = { count: 123 };
    let capturedState: StartNode.State | undefined;
    const captureSuccess: Node<StartNode.State> = (_s) => {
      return stop();
    };
    const captureError: Node<StartNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: StartNode.Utils = {
      readLine: () => "abc",
      print: () => {},
    };

    const result = await StartNode.create(
      { onSuccess: captureSuccess, onError: captureError },
      utils,
    )(initialState);

    await result();

    assertEquals(capturedState?.count, 123);
  },
);
