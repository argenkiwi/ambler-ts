import * as PromptResolveNode from "./promptResolveNode.ts";
import { Nextable } from "../ambler.ts";
import { assertEquals } from "@std/assert";

const baseState: PromptResolveNode.State = {
  m3uFilePath: "playlist.m3u",
  urls: ["https://downloads.khinsider.com/game-soundtracks/game/01.mp3"],
};

Deno.test("promptResolveNode: terminates on 'n'", async () => {
  const result = await PromptResolveNode.create(
    { onYes:  () => null },
    { readLine:  () => Promise.resolve("n"), print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("promptResolveNode: terminates on 'no'", async () => {
  const result = await PromptResolveNode.create(
    { onYes:  () => null },
    { readLine:  () => Promise.resolve("no"), print: () => {} },
  )(baseState);
  assertEquals(result, null);
});

Deno.test("promptResolveNode: transitions to onYes on 'y'", async () => {
  let captured: PromptResolveNode.State | undefined;
  const captureNext: Nextable<PromptResolveNode.State> =  (s) => {
    captured = s;
    return null;
  };

  const next = await PromptResolveNode.create(
    { onYes: captureNext },
    { readLine:  () => Promise.resolve("y"), print: () => {} },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.m3uFilePath, "playlist.m3u");
});

Deno.test("promptResolveNode: loops on invalid input, then accepts 'yes'", async () => {
  let callCount = 0;
  let wentToYes = false;
  const captureNext: Nextable<PromptResolveNode.State> =  () => {
    wentToYes = true;
    return null;
  };

  const inputs = ["maybe", "sure", "yes"];
  const next = await PromptResolveNode.create(
    { onYes: captureNext },
    {
      readLine:  () => Promise.resolve(inputs[callCount++] ?? null),
      print: () => {},
    },
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(wentToYes, true);
  assertEquals(callCount, 3);
});
