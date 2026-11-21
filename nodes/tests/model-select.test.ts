import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../model-select.ts";

test("modelSelectNode should transition to onSuccess with selected model", async () => {
  const initialState: State = { host: "http://localhost:11434", model: "" };

  const utils: Utils = {
    listModels: (_host: string) => Promise.resolve(["llama3", "mistral"]),
    getPrompt: (_msg: string) => "2",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  expect(result[0]).toEqual("next");
  expect(result[1].model).toEqual("mistral");
});

test("modelSelectNode should default to first model if choice is empty", async () => {
  const initialState: State = { host: "http://localhost:11434", model: "" };

  const utils: Utils = {
    listModels: (_host: string) => Promise.resolve(["llama3", "mistral"]),
    getPrompt: (_msg: string) => "",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  expect(result[0]).toEqual("next");
  expect(result[1].model).toEqual("llama3");
});

test("modelSelectNode should allow manual model entry if no models found", async () => {
  const initialState: State = { host: "http://localhost:11434", model: "" };

  const utils: Utils = {
    listModels: (_host: string) => Promise.resolve([]),
    getPrompt: (_msg: string) => "custom-model",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  expect(result[0]).toEqual("next");
  expect(result[1].model).toEqual("custom-model");
});
