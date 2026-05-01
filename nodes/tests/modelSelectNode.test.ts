import { assertEquals } from "@std/assert";
import modelSelectNode, { State, Utils } from "../modelSelectNode.ts";

const baseState: State = {
  selectedModel: "",
  ollamaHost: "http://localhost:11434",
};

const models = ["llama3", "mistral", "gemma"];

Deno.test(
  "modelSelectNode should call onCancel when readLine returns null",
  async () => {
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await modelSelectNode(
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
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => "abc",
      print: (_msg: string) => {},
    };

    const result = await modelSelectNode(
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
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => "99",
      print: (_msg: string) => {},
    };

    const result = await modelSelectNode(
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
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => "1",
      print: (_msg: string) => {},
    };

    const result = await modelSelectNode(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1].selectedModel, "mistral");
  },
);
