import * as SolarGenerateNode from "./solarGenerateNode.ts";
import { assertEquals } from "@std/assert";

const baseState: SolarGenerateNode.State = {
  ollamaHost: "http://localhost:11434",
  selectedModel: "llama3",
  solarPrompt: "A village harnesses solar energy",
  generatedStory: "",
};

Deno.test(
  "solarGenerateNode should set generatedStory and transition onGenerateComplete",
  async () => {
    const utils: SolarGenerateNode.Utils = {
      generateStory: (_host, _model, _prompt) =>
        Promise.resolve("Once upon a time in a solarpunk world..."),
      print: () => {},
    };

    const result = await SolarGenerateNode.create(
      { onGenerateComplete: "onGenerateComplete", onError: "onError" },
      utils,
    )(baseState);

    assertEquals(result.next, "onGenerateComplete");
    assertEquals(
      result.state.generatedStory,
      "Once upon a time in a solarpunk world...",
    );
  },
);

Deno.test(
  "solarGenerateNode should call onError when generateStory throws",
  async () => {
    const utils: SolarGenerateNode.Utils = {
      generateStory: (_host, _model, _prompt) => {
        throw new Error("model unavailable");
      },
      print: () => {},
    };

    const result = await SolarGenerateNode.create(
      { onGenerateComplete: "onGenerateComplete", onError: "onError" },
      utils,
    )(baseState);

    assertEquals(result.next, "onError");
    assertEquals(result.state, baseState);
  },
);
