import { assertEquals } from "@std/assert";
import * as ModelSelectNode from "./modelSelectNode.ts";
import { Node, stop } from "../ambler.ts";

const baseState: ModelSelectNode.State = {
  selectedModel: "",
  ollamaHost: "http://localhost:11434",
};

const models = ["llama3", "mistral", "gemma"];

Deno.test(
  "modelSelectNode should call onCancel when readLine returns null",
  async () => {
    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: (_s) => stop(), onCancel: () => stop() },
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
  "modelSelectNode should transition with unchanged state when input is NaN",
  async () => {
    let capturedState: ModelSelectNode.State | undefined;
    const captureNext: Node<ModelSelectNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "abc",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

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
      return stop();
    };

    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "99",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

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
      return stop();
    };

    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "1",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

    await result();

    assertEquals(capturedState?.selectedModel, "mistral");
  },
);
