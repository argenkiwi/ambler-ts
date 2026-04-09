import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PromptResolveNode } from "./promptResolveNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: PromptResolveNode.State = {
  m3uFilePath: "playlist.m3u",
  urls: ["https://downloads.khinsider.com/game-soundtracks/game/01.mp3"],
};

Deno.test("promptResolveNode: terminates on 'n'", async () => {
  const result = await PromptResolveNode.create(
    { onYes: async () => null },
    { readLine: async () => "n", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("promptResolveNode: terminates on 'no'", async () => {
  const result = await PromptResolveNode.create(
    { onYes: async () => null },
    { readLine: async () => "no", print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("promptResolveNode: transitions to onYes on 'y'", async () => {
  let captured: PromptResolveNode.State | undefined;
  const captureNext: Nextable<PromptResolveNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const next = await PromptResolveNode.create(
    { onYes: captureNext },
    { readLine: async () => "y", print: () => {} },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.m3uFilePath, "playlist.m3u");
});

Deno.test("promptResolveNode: loops on invalid input, then accepts 'yes'", async () => {
  let callCount = 0;
  let wentToYes = false;
  const captureNext: Nextable<PromptResolveNode.State> = async () => {
    wentToYes = true;
    return null;
  };

  const inputs = ["maybe", "sure", "yes"];
  const next = await PromptResolveNode.create(
    { onYes: captureNext },
    {
      readLine: async () => inputs[callCount++] ?? null,
      print: () => {},
    },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(wentToYes, true);
  assertEquals(callCount, 3);
});
