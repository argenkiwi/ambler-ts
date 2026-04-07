import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { CheckM3uFileNode } from "./checkM3uFileNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("checkM3uFileNode should transition to onValid when filePath in state is valid", async () => {
  const initialState: CheckM3uFileNode.State = { filePath: "/some/file.m3u", urls: [] };
  let capturedState: CheckM3uFileNode.State | undefined;
  const captureValid: Nextable<CheckM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: CheckM3uFileNode.Utils = {
    getArg: () => undefined,
    isValidM3uFile: async () => true,
  };

  const nextResult = await CheckM3uFileNode.create(
    { onValid: captureValid, onInvalid: async () => null },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "/some/file.m3u");
});

Deno.test("checkM3uFileNode should use CLI arg when filePath in state is empty", async () => {
  const initialState: CheckM3uFileNode.State = { filePath: "", urls: [] };
  let capturedState: CheckM3uFileNode.State | undefined;
  const captureValid: Nextable<CheckM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: CheckM3uFileNode.Utils = {
    getArg: () => "/cli/arg.m3u",
    isValidM3uFile: async () => true,
  };

  const nextResult = await CheckM3uFileNode.create(
    { onValid: captureValid, onInvalid: async () => null },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "/cli/arg.m3u");
});

Deno.test("checkM3uFileNode should transition to onInvalid when path is not valid", async () => {
  const initialState: CheckM3uFileNode.State = { filePath: "/bad/file.m3u", urls: [] };
  let capturedState: CheckM3uFileNode.State | undefined;
  const captureInvalid: Nextable<CheckM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: CheckM3uFileNode.Utils = {
    getArg: () => undefined,
    isValidM3uFile: async () => false,
  };

  const nextResult = await CheckM3uFileNode.create(
    { onValid: async () => null, onInvalid: captureInvalid },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "");
});

Deno.test("checkM3uFileNode should transition to onInvalid when no path is available", async () => {
  const initialState: CheckM3uFileNode.State = { filePath: "", urls: [] };
  let capturedState: CheckM3uFileNode.State | undefined;
  const captureInvalid: Nextable<CheckM3uFileNode.State> = async (s) => { capturedState = s; return null; };

  const utils: CheckM3uFileNode.Utils = {
    getArg: () => undefined,
    isValidM3uFile: async () => false,
  };

  const nextResult = await CheckM3uFileNode.create(
    { onValid: async () => null, onInvalid: captureInvalid },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.filePath, "");
});
