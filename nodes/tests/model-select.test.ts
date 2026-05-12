import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../model-select.ts";

Deno.test("modelSelectNode should transition to onSuccess with selected model", async () => {
  const initialState: State = { host: "http://localhost:11434", model: "" };

  const utils: Utils = {
    listModels: (_host: string) => Promise.resolve(["llama3", "mistral"]),
    getPrompt: (_msg: string) => "2",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].model, "mistral");
});

Deno.test("modelSelectNode should default to first model if choice is empty", async () => {
  const initialState: State = { host: "http://localhost:11434", model: "" };

  const utils: Utils = {
    listModels: (_host: string) => Promise.resolve(["llama3", "mistral"]),
    getPrompt: (_msg: string) => "",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].model, "llama3");
});

Deno.test("modelSelectNode should allow manual model entry if no models found", async () => {
  const initialState: State = { host: "http://localhost:11434", model: "" };

  const utils: Utils = {
    listModels: (_host: string) => Promise.resolve([]),
    getPrompt: (_msg: string) => "custom-model",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  assertEquals(result[0], "next");
  assertEquals(result[1].model, "custom-model");
});
