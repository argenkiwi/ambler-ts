import { assertEquals } from "@std/assert";
import { factory, Utils } from "../modelSelect.ts";

const input = "http://localhost:11434";

const models = ["llama3", "mistral", "gemma"];

Deno.test(
  "modelSelectNode should call onCancel when readLine returns null",
  async () => {
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(input);

    assertEquals(result[0], "onCancel");
    assertEquals(result[1], "");
  },
);

Deno.test(
  "modelSelectNode should transition with empty selection when input is NaN",
  async () => {
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => "abc",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(input);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1], "");
  },
);

Deno.test(
  "modelSelectNode should transition with empty selection when index is out of range",
  async () => {
    const utils: Utils = {
      listModels: (_host: string) => Promise.resolve(models),
      readLine: (_msg: string) => "99",
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(input);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1], "");
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

    const result = await factory(
      { onSelect: "onSelect", onCancel: "onCancel" },
      utils,
    )(input);

    assertEquals(result[0], "onSelect");
    assertEquals(result[1], "mistral");
  },
);
