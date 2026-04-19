import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as ModelSelectNode from "./modelSelectNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: ModelSelectNode.State = {
  selectedModel: "",
  ollamaHost: "http://localhost:11434",
};

const models = ["llama3", "mistral", "gemma"];

Deno.test(
  "modelSelectNode should return null when readLine returns null",
  async () => {
    const utils: ModelSelectNode.Utils = {
      listModels: async (_host) => models,
      readLine: async (_msg) => null,
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: async (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "modelSelectNode should transition with unchanged state when input is NaN",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Nextable<ModelSelectNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: ModelSelectNode.Utils = {
      listModels: async (_host) => models,
      readLine: async (_msg) => "abc",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.selectedModel, "");
  },
);

Deno.test(
  "modelSelectNode should transition with unchanged state when index is out of range",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Nextable<ModelSelectNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: ModelSelectNode.Utils = {
      listModels: async (_host) => models,
      readLine: async (_msg) => "99",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.selectedModel, "");
  },
);

Deno.test(
  "modelSelectNode should set selectedModel when valid index is given",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Nextable<ModelSelectNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: ModelSelectNode.Utils = {
      listModels: async (_host) => models,
      readLine: async (_msg) => "1",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(capturedState?.selectedModel, "mistral");
  },
);
