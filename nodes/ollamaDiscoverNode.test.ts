import { assertEquals } from "@std/assert";
import * as OllamaDiscoverNode from "./ollamaDiscoverNode.ts";

const baseState: OllamaDiscoverNode.State = { ollamaHost: "" };

Deno.test(
  "ollamaDiscoverNode should set ollamaHost when a candidate host is reachable",
  async () => {
    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (host) => Promise.resolve(host === "http://localhost:11434"),
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: "onDiscovered", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "onDiscovered");
    assertEquals(result.state.ollamaHost, "http://localhost:11434");
  },
);

Deno.test(
  "ollamaDiscoverNode should call onCancel when no host found and readLine returns null",
  async () => {
    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (_host) => Promise.resolve(false),
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: "onDiscovered", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "onCancel");
    assertEquals(result.state, baseState);
  },
);

Deno.test(
  "ollamaDiscoverNode should use manual host when no candidate is reachable",
  async () => {
    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (_host) => Promise.resolve(false),
      readLine: (_msg) => "  http://192.168.1.5:11434  ",
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: "onDiscovered", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result.next, "onDiscovered");
    assertEquals(result.state.ollamaHost, "http://192.168.1.5:11434");
  },
);
