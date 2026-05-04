import { assertEquals } from "@std/assert";
import ollamaDiscoverNode, { State, Utils } from "../ollamaDiscoverNode.ts";

const baseState: State = { ollamaHost: "" };

Deno.test(
  "ollamaDiscoverNode should set ollamaHost when a candidate host is reachable",
  async () => {
    const utils: Utils = {
      tryHost: (host: string) =>
        Promise.resolve(host === "http://localhost:11434"),
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await ollamaDiscoverNode(
      { onDiscovered: "onDiscovered", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onDiscovered");
    assertEquals(result[1].ollamaHost, "http://localhost:11434");
  },
);

Deno.test(
  "ollamaDiscoverNode should call onCancel when no host found and readLine returns null",
  async () => {
    const utils: Utils = {
      tryHost: (_host: string) => Promise.resolve(false),
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await ollamaDiscoverNode(
      { onDiscovered: "onDiscovered", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onCancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "ollamaDiscoverNode should use manual host when no candidate is reachable",
  async () => {
    const utils: Utils = {
      tryHost: (_host: string) => Promise.resolve(false),
      readLine: (_msg: string) => "  http://192.168.1.5:11434  ",
      print: (_msg: string) => {},
    };

    const result = await ollamaDiscoverNode(
      { onDiscovered: "onDiscovered", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onDiscovered");
    assertEquals(result[1].ollamaHost, "http://192.168.1.5:11434");
  },
);
