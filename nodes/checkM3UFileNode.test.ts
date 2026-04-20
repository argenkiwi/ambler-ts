import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as CheckM3UFileNode from "./checkM3UFileNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: CheckM3UFileNode.State = { m3uFilePath: "", urls: [] };

function makeUtils(overrides: Partial<CheckM3UFileNode.Utils>): CheckM3UFileNode.Utils {
  return {
    args: () => [],
    stat: async () => ({ isFile: true } as Deno.FileInfo),
    print: () => {},
    ...overrides,
  };
}

Deno.test("checkM3UFileNode: terminates when no arg provided", async () => {
  const result = await CheckM3UFileNode.create(
    { onSuccess: async () => null },
    makeUtils({ args: () => [] }),
  )(baseState);
  assertEquals(result, null);
});

Deno.test("checkM3UFileNode: terminates when extension is not .m3u", async () => {
  const result = await CheckM3UFileNode.create(
    { onSuccess: async () => null },
    makeUtils({ args: () => ["playlist.txt"] }),
  )(baseState);
  assertEquals(result, null);
});

Deno.test("checkM3UFileNode: terminates when stat throws (file not found)", async () => {
  const result = await CheckM3UFileNode.create(
    { onSuccess: async () => null },
    makeUtils({
      args: () => ["missing.m3u"],
      stat: async () => { throw new Error("not found"); },
    }),
  )(baseState);
  assertEquals(result, null);
});

Deno.test("checkM3UFileNode: terminates when path is not a file", async () => {
  const result = await CheckM3UFileNode.create(
    { onSuccess: async () => null },
    makeUtils({
      args: () => ["somedir.m3u"],
      stat: async () => ({ isFile: false } as Deno.FileInfo),
    }),
  )(baseState);
  assertEquals(result, null);
});

Deno.test("checkM3UFileNode: transitions to onSuccess with filePath in state", async () => {
  let captured: CheckM3UFileNode.State | undefined;
  const captureNext: Nextable<CheckM3UFileNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const next = await CheckM3UFileNode.create(
    { onSuccess: captureNext },
    makeUtils({ args: () => ["playlist.m3u"] }),
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.m3uFilePath, "playlist.m3u");
});
