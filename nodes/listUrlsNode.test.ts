import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ListUrlsNode } from "./listUrlsNode.ts";
import { Nextable } from "../ambler.ts";

Deno.test("listUrlsNode should print all URLs", async () => {
  const initialState: ListUrlsNode.State = {
    urls: ["https://example.com/a.mp3", "https://example.com/b.mp3"],
  };
  const printed: string[] = [];

  const utils: ListUrlsNode.Utils = {
    print: (msg) => printed.push(msg),
  };

  const nextResult = await ListUrlsNode.create(
    { onDone: async () => null },
    utils,
  )(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(printed, ["https://example.com/a.mp3", "https://example.com/b.mp3"]);
});

Deno.test("listUrlsNode should transition to onDone", async () => {
  const initialState: ListUrlsNode.State = { urls: ["https://example.com/a.mp3"] };
  let capturedState: ListUrlsNode.State | undefined;
  const captureDone: Nextable<ListUrlsNode.State> = async (s) => { capturedState = s; return null; };

  const utils: ListUrlsNode.Utils = { print: () => {} };

  const nextResult = await ListUrlsNode.create({ onDone: captureDone }, utils)(initialState);

  if (!nextResult) throw new Error("Expected Next, got null");
  await nextResult.run();

  assertEquals(capturedState?.urls, ["https://example.com/a.mp3"]);
});
