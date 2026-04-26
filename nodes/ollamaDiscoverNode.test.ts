import { assertEquals } from "@std/assert";
import * as OllamaDiscoverNode from "./ollamaDiscoverNode.ts";
import { Node, stop } from "../ambler.ts";

const baseState: OllamaDiscoverNode.State = { ollamaHost: "" };

Deno.test(
  "ollamaDiscoverNode should set ollamaHost when a candidate host is reachable",
  async () => {
    let capturedState: OllamaDiscoverNode.State | undefined;
    const captureNext: Node<OllamaDiscoverNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (host) => Promise.resolve(host === "http://localhost:11434"),
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

    await result();

    assertEquals(capturedState?.ollamaHost, "http://localhost:11434");
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
      { onDiscovered: (_s) => stop(), onCancel: () => stop() },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
  },
);

Deno.test(
  "ollamaDiscoverNode should use manual host when no candidate is reachable",
  async () => {
    let capturedState: OllamaDiscoverNode.State | undefined;
    const captureNext: Node<OllamaDiscoverNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: OllamaDiscoverNode.Utils = {
      tryHost: (_host) => Promise.resolve(false),
      readLine: (_msg) => "  http://192.168.1.5:11434  ",
      print: () => {},
    };

    const result = await OllamaDiscoverNode.create(
      { onDiscovered: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

    await result();

    assertEquals(capturedState?.ollamaHost, "http://192.168.1.5:11434");
  },
);
