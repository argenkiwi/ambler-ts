import { assertEquals } from "@std/assert";
import * as OllamaDiscoverNode from "./ollamaDiscoverNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: OllamaDiscoverNode.State = { ollamaHost: "" };

Deno.test(
  "ollamaDiscoverNode should set ollamaHost when a candidate host is reachable",
  async () => {
    let capturedState: OllamaDiscoverNode.State | undefined;
    const captureNext: Nextable<OllamaDiscoverNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (host) => Promise.resolve(host === "http://localhost:11434"),
      readLine: (_msg) => Promise.resolve(null),
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.ollamaHost, "http://localhost:11434");
  },
);

Deno.test(
  "ollamaDiscoverNode should return null when no host found and readLine returns null",
  async () => {
    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (_host) => Promise.resolve(false),
      readLine: (_msg) => Promise.resolve(null),
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "ollamaDiscoverNode should use manual host when no candidate is reachable",
  async () => {
    let capturedState: OllamaDiscoverNode.State | undefined;
    const captureNext: Nextable<OllamaDiscoverNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (_host) => Promise.resolve(false),
      readLine: (_msg) => Promise.resolve("  http://192.168.1.5:11434  "),
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.ollamaHost, "http://192.168.1.5:11434");
  },
);
