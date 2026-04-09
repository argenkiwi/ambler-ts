import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PromptDownloadNode } from "./promptDownloadNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: PromptDownloadNode.State = {
  m3uFilePath: "playlist.m3u",
  urls: ["https://example.com/song.mp3"],
};

Deno.test("promptDownloadNode: terminates on 'n'", async () => {
  const result = await PromptDownloadNode.create(
    { onYes: async () => null },
    { readLine: async () => "n", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("promptDownloadNode: terminates on 'no'", async () => {
  const result = await PromptDownloadNode.create(
    { onYes: async () => null },
    { readLine: async () => "no", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("promptDownloadNode: transitions to onYes on 'y'", async () => {
  let captured: PromptDownloadNode.State | undefined;
  const captureNext: Nextable<PromptDownloadNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const next = await PromptDownloadNode.create(
    { onYes: captureNext },
    { readLine: async () => "y", print: () => {} },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.m3uFilePath, "playlist.m3u");
});

Deno.test("promptDownloadNode: loops on invalid input, then accepts 'yes'", async () => {
  let callCount = 0;
  let wentToYes = false;
  const captureNext: Nextable<PromptDownloadNode.State> = async () => {
    wentToYes = true;
    return null;
  };

  const inputs = ["maybe", "yes"];
  const next = await PromptDownloadNode.create(
    { onYes: captureNext },
    {
      readLine: async () => inputs[callCount++] ?? null,
      print: () => {},
    },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(wentToYes, true);
  assertEquals(callCount, 2);
});
