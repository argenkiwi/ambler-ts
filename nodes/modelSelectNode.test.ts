import { assertEquals } from "@std/assert";
import * as ModelSelectNode from "./modelSelectNode.ts";

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
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onCancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "modelSelectNode should transition with unchanged state when input is NaN",
  async () => {
    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "abc",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1].selectedModel, "");
  },
);

Deno.test(
  "modelSelectNode should transition with unchanged state when index is out of range",
  async () => {
    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "99",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1].selectedModel, "");
  },
);

Deno.test(
  "modelSelectNode should set selectedModel when valid index is given",
  async () => {
    const utils: ModelSelectNode.Utils = {
      listModels: (_host) => Promise.resolve(models),
      readLine: (_msg) => "1",
      print: () => {},
    };

    const result = await ModelSelectNode.create(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1].selectedModel, "mistral");
  },
);
