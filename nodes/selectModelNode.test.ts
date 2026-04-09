import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { SelectModelNode } from "./selectModelNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: SelectModelNode.State = { model: "" };

function makeUtils(
  models: string[],
  inputs: string[],
): SelectModelNode.Utils {
  let callCount = 0;
  return {
    listModels: async () => models,
    readLine: async () => inputs[callCount++] ?? null,
    print: () => {},
  };
}

Deno.test("selectModelNode: terminates when no models available", async () => {
  const result = await SelectModelNode.create(
    { onSuccess: async () => null },
    makeUtils([], []),
  )(baseState);
  assertEquals(result, null);
});

Deno.test("selectModelNode: selects model by number", async () => {
  let captured: SelectModelNode.State | undefined;
  const captureNext: Nextable<SelectModelNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const models = ["llama3", "mistral", "phi3"];
  const next = await SelectModelNode.create(
    { onSuccess: captureNext },
    makeUtils(models, ["2"]),
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.model, "mistral");
});

Deno.test("selectModelNode: loops on invalid input, then accepts valid selection", async () => {
  let captured: SelectModelNode.State | undefined;
  const captureNext: Nextable<SelectModelNode.State> = async (s) => {
    captured = s;
    return null;
  };

  const models = ["llama3", "mistral"];
  const next = await SelectModelNode.create(
    { onSuccess: captureNext },
    makeUtils(models, ["0", "abc", "5", "1"]),
  )(baseState);

  if (!next) throw new Error("Expected Next, got null");
  await next.run();

  assertEquals(captured?.model, "llama3");
});
