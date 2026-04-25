import { assertEquals } from "@std/assert";
import * as ModelSelectNode from "./modelSelectNode.ts";
import { Node } from "../ambler.ts";

const baseState: ModelSelectNode.State = {
  selectedModel: "",
  ollamaHost: "http://localhost:11434",
};

const models = ["llama3", "mistral", "gemma"];

Deno.test(
  "modelSelectNode should return null when readLine returns null",
  async () => {
    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "modelSelectNode should transition with unchanged state when input is NaN",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Node<ModelSelectNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "abc",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    assertEquals(capturedState?.selectedModel, "");
  },
);

Deno.test(
  "modelSelectNode should transition with unchanged state when index is out of range",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Node<ModelSelectNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "99",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    assertEquals(capturedState?.selectedModel, "");
  },
);

Deno.test(
  "modelSelectNode should set selectedModel when valid index is given",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Node<ModelSelectNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "1",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    assertEquals(capturedState?.selectedModel, "mistral");
  },
);
