import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { SolarGenerateNode } from "./solarGenerateNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: SolarGenerateNode.State = {
  ollamaHost: "http://localhost:11434",
  selectedModel: "llama3",
  solarPrompt: "A village harnesses solar energy",
  generatedStory: "",
};

Deno.test("solarGenerateNode should set generatedStory and transition onGenerateComplete", async () => {
  let capturedState: SolarGenerateNode.State | undefined;
  const captureNext: Nextable<SolarGenerateNode.State> = async (s) => {
    capturedState = s;
    return null;
  };

  const utils: SolarGenerateNode.Utils = {
    generateStory: async (_host, _model, _prompt) => "Once upon a time in a solarpunk world...",
    print: () => {},
  };

  const result = await SolarGenerateNode.create({ onGenerateComplete: captureNext }, utils)(baseState);

  if (!result) throw new Error("Expected Next, got null");
  await result.run();

  assertEquals(capturedState?.generatedStory, "Once upon a time in a solarpunk world...");
});

Deno.test("solarGenerateNode should return null when generateStory throws", async () => {
  const utils: SolarGenerateNode.Utils = {
    generateStory: async (_host, _model, _prompt) => { throw new Error("model unavailable"); },
    print: () => {},
  };

  const result = await SolarGenerateNode.create(
    { onGenerateComplete: async (_s) => null },
    utils,
  )(baseState);

  assertEquals(result, null);
});
